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
import { TrendingUp, ChevronRight, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen bg-background bg-mesh relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-hero rounded-full opacity-15 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-accent rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-gradient-warm rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display gradient-text">MarketPulse</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Step {currentStep} of 1</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={100} className="h-2 bg-muted rounded-full overflow-hidden" />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="glass border-0 shadow-elevated overflow-hidden">
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle className="text-3xl font-display mb-3">Select Your Portfolio</CardTitle>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Choose the Indian companies you have invested in to get personalized insights
              </p>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="space-y-8">
                {Object.entries(groupedCompanies).map(([sector, companies]) => (
                  <div key={sector} className="space-y-4">
                    <h3 className="text-lg font-semibold font-display text-primary flex items-center gap-2 pb-2 border-b border-border/50">
                      <span className="w-2 h-2 rounded-full bg-gradient-hero" />
                      {sector}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {companies.map((company) => {
                        const isSelected = selectedCompanies.includes(company.id);
                        return (
                          <div
                            key={company.id}
                            className={cn(
                              "group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
                              isSelected
                                ? "border-accent bg-accent/5 shadow-accent-glow"
                                : "border-border hover:border-primary/30 hover:bg-muted/30"
                            )}
                            onClick={() => handleCompanyToggle(company.id)}
                          >
                            {/* Custom checkbox */}
                            <div className={cn(
                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
                              isSelected
                                ? "bg-accent border-accent"
                                : "border-muted-foreground/30 group-hover:border-primary/50"
                            )}>
                              {isSelected && <Check className="w-4 h-4 text-accent-foreground" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold truncate">{company.name}</p>
                                  <p className="text-sm text-muted-foreground">{company.symbol}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">₹{company.currentPrice.toFixed(2)}</p>
                                  <p className={cn(
                                    "text-sm font-medium",
                                    company.change >= 0 ? "text-success" : "text-destructive"
                                  )}>
                                    {company.change >= 0 ? '+' : ''}{company.changePercent.toFixed(2)}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{selectedCompanies.length}</span> companies selected
                  </p>
                </div>
                <Button
                  onClick={handleContinue}
                  variant="gradient"
                  size="lg"
                  disabled={loading || selectedCompanies.length === 0}
                  className="min-w-[200px]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Continue to MarketPulse
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
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
