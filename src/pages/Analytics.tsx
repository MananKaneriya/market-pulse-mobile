import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FeedbackWidget from '@/components/FeedbackWidget';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { INDIAN_STOCKS, FUNDAMENTAL_DATA, generateChartData } from '@/lib/dummyData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Analytics = () => {
  const { user, loading } = useAuth();
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [chartData, setChartData] = useState(generateChartData());
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserStocks();
    }
  }, [user]);

  useEffect(() => {
    setChartData(generateChartData());
  }, [selectedStock]);

  const fetchUserStocks = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_stock_selections')
      .select('stock_symbol')
      .eq('user_id', user.id);

    if (data && data.length > 0) {
      setSelectedStocks(data.map(d => d.stock_symbol));
      setSelectedStock(data[0].stock_symbol);
    }
  };

  const fundamentals = FUNDAMENTAL_DATA[selectedStock as keyof typeof FUNDAMENTAL_DATA] || FUNDAMENTAL_DATA.RELIANCE;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4 md:pt-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Analytics & Charts</h1>
          <p className="text-muted-foreground">Detailed analysis of your stocks</p>
        </div>

        <Card className="p-4 mb-6">
          <label className="text-sm font-medium mb-2 block">Select Stock</label>
          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(selectedStocks.length > 0 ? selectedStocks : INDIAN_STOCKS.map(s => s.symbol)).map(symbol => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol} - {INDIAN_STOCKS.find(s => s.symbol === symbol)?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">P/E Ratio</p>
            <p className="text-2xl font-bold">{fundamentals.pe}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">EPS</p>
            <p className="text-2xl font-bold">₹{fundamentals.eps}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">ROE</p>
            <p className="text-2xl font-bold">{fundamentals.roe}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
            <p className="text-2xl font-bold">{fundamentals.marketCap}</p>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <Tabs defaultValue="price" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="price">Price Chart</TabsTrigger>
              <TabsTrigger value="volume">Volume</TabsTrigger>
            </TabsList>
            
            <TabsContent value="price" className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="volume" className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                  />
                  <Bar dataKey="volume" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Technical Indicators</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-2">RSI (14)</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: '62%' }}></div>
                </div>
                <span className="font-semibold">62</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Neutral territory</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Moving Averages</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>MA(50)</span>
                  <span className="font-semibold">₹2,856</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>MA(200)</span>
                  <span className="font-semibold">₹2,742</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <FeedbackWidget screenName="analytics" />
    </div>
  );
};

export default Analytics;
