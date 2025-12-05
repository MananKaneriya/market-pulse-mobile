import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { INDIAN_STOCKS, IndianStockCompany } from '@/lib/dummyData';
import { TrendingUp, ChevronRight } from 'lucide-react';

const Onboarding = () => {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleCompanyToggle = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleContinue = async () => {
    if (selectedCompanies.length === 0) {
      toast({
        title: 'Select at least one company',
        description: 'Please select at least one company to continue',
        variant: 'destructive',
      });
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      // Delete existing selections
      await supabase
        .from('user_stock_selections')
        .delete()
        .eq('user_id', user.id);

      // Insert new selections
      const selections = selectedCompanies.map(companyId => {
        const company = INDIAN_STOCKS.find(s => s.id === companyId);
        return {
          user_id: user.id,
          stock_symbol: company?.symbol || companyId,
          stock_name: company?.name || companyId,
        };
      });

      const { error } = await supabase
        .from('user_stock_selections')
        .insert(selections);

      if (error) throw error;

      // Save to localStorage for quick access
      localStorage.setItem('marketpulse-selected-companies', JSON.stringify(selectedCompanies));
      localStorage.setItem('marketpulse-onboarding-complete', 'true');

      toast({
        title: 'All set!',
        description: `${selectedCompanies.length} companies selected successfully!`,
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save preferences.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Group companies by sector
  const groupedCompanies = INDIAN_STOCKS.reduce((acc, company) => {
    if (!acc[company.sector]) {
      acc[company.sector] = [];
    }
    acc[company.sector].push(company);
    return acc;
  }, {} as Record<string, IndianStockCompany[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fintech-blue to-fintech-green">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2 text-white">
            <TrendingUp className="h-6 w-6" />
            <span className="text-xl font-bold">MarketPulse</span>
          </div>
          <div className="text-white text-sm">
            Step {currentStep} of 1
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={100} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl mb-2">Select Your Portfolio</CardTitle>
              <p className="text-muted-foreground text-lg">
                Choose the Indian companies you have invested in to get personalized insights
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedCompanies).map(([sector, companies]) => (
                  <div key={sector} className="space-y-3">
                    <h3 className="text-lg font-semibold text-fintech-blue border-b pb-2">
                      {sector}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {companies.map((company) => (
                        <div
                          key={company.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:bg-muted/50 ${
                            selectedCompanies.includes(company.id)
                              ? 'border-fintech-green bg-fintech-green/5'
                              : 'border-border'
                          }`}
                          onClick={() => handleCompanyToggle(company.id)}
                        >
                          <Checkbox
                            checked={selectedCompanies.includes(company.id)}
                            onCheckedChange={() => handleCompanyToggle(company.id)}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{company.name}</p>
                                <p className="text-sm text-muted-foreground">{company.symbol}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">₹{company.currentPrice.toFixed(2)}</p>
                                <p className={`text-sm ${
                                  company.change >= 0 ? 'text-fintech-green' : 'text-fintech-red'
                                }`}>
                                  {company.change >= 0 ? '+' : ''}{company.changePercent.toFixed(2)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {selectedCompanies.length} companies selected
                </p>
                <Button
                  onClick={handleContinue}
                  className="bg-fintech-green hover:bg-fintech-green/90 px-8"
                  disabled={loading || selectedCompanies.length === 0}
                >
                  {loading ? 'Saving...' : 'Continue to MarketPulse'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
