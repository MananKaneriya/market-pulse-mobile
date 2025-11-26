import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { INDIAN_STOCKS } from '@/lib/dummyData';
import { TrendingUp } from 'lucide-react';

const Onboarding = () => {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const toggleStock = (symbol: string) => {
    setSelectedStocks(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const handleContinue = async () => {
    if (selectedStocks.length === 0) {
      toast({
        title: 'Select at least one stock',
        description: 'Choose the companies you want to track.',
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
      const selections = selectedStocks.map(symbol => ({
        user_id: user.id,
        stock_symbol: symbol,
        stock_name: INDIAN_STOCKS.find(s => s.symbol === symbol)?.name || symbol,
      }));

      const { error } = await supabase
        .from('user_stock_selections')
        .insert(selections);

      if (error) throw error;

      toast({
        title: 'All set!',
        description: 'Your preferences have been saved.',
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

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl p-6 md:p-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold">MarketPulse</h1>
        </div>

        <h2 className="text-xl font-semibold mb-2">Choose your stocks</h2>
        <p className="text-muted-foreground mb-6">
          Select the Indian companies you invest in or want to track. You can change this later in settings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {INDIAN_STOCKS.map(stock => (
            <div
              key={stock.symbol}
              className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => toggleStock(stock.symbol)}
            >
              <Checkbox
                checked={selectedStocks.includes(stock.symbol)}
                onCheckedChange={() => toggleStock(stock.symbol)}
              />
              <div className="flex-1">
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-muted-foreground">{stock.name}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedStocks.length} selected
          </p>
          <Button onClick={handleContinue} disabled={loading || selectedStocks.length === 0}>
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;
