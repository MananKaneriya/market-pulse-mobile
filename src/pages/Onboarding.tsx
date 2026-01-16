import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { INDIAN_STOCKS, IndianStockCompany } from '@/lib/dummyData';
import { TrendingUp, TrendingDown, ChevronRight, Sparkles, Check, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sector icons/colors for visual grouping
const SECTOR_STYLES: Record<string, { gradient: string; icon: string }> = {
  'Information Technology': { gradient: 'from-blue-500 to-cyan-500', icon: '💻' },
  'Banking & Finance': { gradient: 'from-emerald-500 to-teal-500', icon: '🏦' },
  'Energy & Conglomerate': { gradient: 'from-amber-500 to-orange-500', icon: '⚡' },
  'FMCG': { gradient: 'from-pink-500 to-rose-500', icon: '🛒' },
  'Telecommunications': { gradient: 'from-violet-500 to-purple-500', icon: '📡' },
  'Infrastructure': { gradient: 'from-slate-500 to-zinc-500', icon: '🏗️' },
  'Consumer Durables': { gradient: 'from-indigo-500 to-blue-500', icon: '📺' },
  'Automobile': { gradient: 'from-red-500 to-orange-500', icon: '🚗' },
  'Healthcare': { gradient: 'from-green-500 to-emerald-500', icon: '💊' },
};

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Subtle background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-accent/20 to-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-32 right-1/3 w-[350px] h-[350px] bg-gradient-to-br from-muted to-background rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 relative z-10 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/25">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-display bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">MarketPulse</span>
              <p className="text-xs text-muted-foreground">Portfolio Setup</p>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1.5 bg-background/80 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-accent mr-1.5" />
            <span className="text-xs font-medium">Step {currentStep} of 1</span>
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={100} className="h-1.5 bg-muted/50" />
        </div>

        {/* Main Content Card */}
        <Card className="border-0 shadow-2xl shadow-black/5 bg-card/80 backdrop-blur-xl overflow-hidden">
          <CardHeader className="text-center pb-4 pt-8 px-6 md:px-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 mx-auto mb-4">
              <Building2 className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-display mb-2">Build Your Portfolio</CardTitle>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Select the companies you've invested in to receive personalized market insights and sentiment analysis
            </p>
          </CardHeader>
          
          <CardContent className="px-4 md:px-8 pb-8">
            {/* Selection Counter - Floating */}
            <div className="sticky top-0 z-20 flex justify-center mb-6 -mt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/95 backdrop-blur-sm border shadow-lg">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  selectedCompanies.length > 0 
                    ? "bg-accent text-accent-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {selectedCompanies.length}
                </div>
                <span className="text-sm font-medium">
                  {selectedCompanies.length === 1 ? 'Company' : 'Companies'} Selected
                </span>
              </div>
            </div>

            {/* Sectors Grid */}
            <div className="space-y-8">
              {Object.entries(groupedCompanies).map(([sector, companies]) => {
                const sectorStyle = SECTOR_STYLES[sector] || { gradient: 'from-gray-500 to-slate-500', icon: '📊' };
                const selectedInSector = companies.filter(c => selectedCompanies.includes(c.id)).length;
                
                return (
                  <div key={sector} className="space-y-4">
                    {/* Sector Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg shadow-sm",
                          sectorStyle.gradient
                        )}>
                          {sectorStyle.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{sector}</h3>
                          <p className="text-xs text-muted-foreground">{companies.length} stocks available</p>
                        </div>
                      </div>
                      {selectedInSector > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedInSector} selected
                        </Badge>
                      )}
                    </div>
                    
                    {/* Stock Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {companies.map((company) => {
                        const isSelected = selectedCompanies.includes(company.id);
                        const isPositive = company.change >= 0;
                        
                        return (
                          <div
                            key={company.id}
                            onClick={() => handleCompanyToggle(company.id)}
                            className={cn(
                              "group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-out",
                              "hover:shadow-lg hover:-translate-y-0.5",
                              isSelected
                                ? "border-accent bg-accent/5 shadow-md shadow-accent/10"
                                : "border-border/60 bg-background/50 hover:border-primary/40 hover:bg-background/80"
                            )}
                          >
                            {/* Selection Indicator */}
                            <div className={cn(
                              "absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
                              isSelected
                                ? "bg-accent border-accent scale-100"
                                : "border-muted-foreground/30 group-hover:border-primary/50 scale-90 group-hover:scale-100"
                            )}>
                              {isSelected && <Check className="w-3 h-3 text-accent-foreground" />}
                            </div>
                            
                            {/* Stock Info */}
                            <div className="pr-6">
                              {/* Symbol Badge */}
                              <div className="inline-flex items-center gap-1.5 mb-2">
                                <span className={cn(
                                  "text-xs font-bold px-2 py-0.5 rounded-md transition-colors",
                                  isSelected 
                                    ? "bg-accent/20 text-accent" 
                                    : "bg-muted text-muted-foreground"
                                )}>
                                  {company.symbol}
                                </span>
                              </div>
                              
                              {/* Company Name */}
                              <h4 className="font-semibold text-sm text-foreground leading-tight mb-3 line-clamp-2 min-h-[2.5rem]">
                                {company.name}
                              </h4>
                              
                              {/* Price & Change */}
                              <div className="flex items-end justify-between">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">Current Price</p>
                                  <p className="text-lg font-bold text-foreground">
                                    ₹{company.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <div className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold",
                                  isPositive 
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                                )}>
                                  {isPositive ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  {isPositive ? '+' : ''}{company.changePercent.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="mt-10 pt-6 border-t border-border/50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    selectedCompanies.length > 0 
                      ? "bg-accent/10" 
                      : "bg-muted"
                  )}>
                    <Check className={cn(
                      "w-5 h-5 transition-colors",
                      selectedCompanies.length > 0 ? "text-accent" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedCompanies.length} {selectedCompanies.length === 1 ? 'Company' : 'Companies'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCompanies.length === 0 
                        ? 'Select at least one to continue' 
                        : 'Ready to continue'}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={handleContinue}
                  size="lg"
                  disabled={loading || selectedCompanies.length === 0}
                  className={cn(
                    "min-w-[220px] h-12 text-base font-semibold rounded-xl transition-all duration-300",
                    "bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90",
                    "shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30",
                    "disabled:opacity-50 disabled:shadow-none"
                  )}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Continue to MarketPulse
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom hint */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          You can update your portfolio selections anytime from Settings
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
