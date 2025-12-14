import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { INDIAN_STOCKS, FUNDAMENTAL_DATA, generateChartData } from '@/lib/dummyData';
import Navbar from '@/components/Navbar';
import FeedbackWidget from '@/components/FeedbackWidget';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Analytics = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [chartData, setChartData] = useState(generateChartData());

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

  // Dummy price data for charts
  const priceData = [
    { name: 'Jan', price: 2400, volume: 1200 },
    { name: 'Feb', price: 2410, volume: 1300 },
    { name: 'Mar', price: 2380, volume: 1100 },
    { name: 'Apr', price: 2420, volume: 1400 },
    { name: 'May', price: 2456, volume: 1250 },
  ];

  const sectorData = [
    { name: 'IT', value: 30, color: 'hsl(var(--accent))' },
    { name: 'Banking', value: 25, color: '#059669' },
    { name: 'Energy', value: 20, color: '#F59E0B' },
    { name: 'FMCG', value: 15, color: '#DC2626' },
    { name: 'Telecom', value: 10, color: '#7C3AED' },
  ];

  const performanceData = selectedStocks.map(symbol => ({
    name: symbol,
    return: (Math.random() * 10 - 3).toFixed(2),
    price: Math.floor(Math.random() * 3000) + 500,
  }));

  const sentimentData = [
    { name: 'Mon', positive: 65, negative: 20, neutral: 15 },
    { name: 'Tue', positive: 72, negative: 18, neutral: 10 },
    { name: 'Wed', positive: 58, negative: 30, neutral: 12 },
    { name: 'Thu', positive: 68, negative: 22, neutral: 10 },
    { name: 'Fri', positive: 75, negative: 15, neutral: 10 },
  ];

  const fundamentals = FUNDAMENTAL_DATA[selectedStock as keyof typeof FUNDAMENTAL_DATA] || FUNDAMENTAL_DATA.RELIANCE;
  const stockInfo = INDIAN_STOCKS.find(s => s.symbol === selectedStock);
  const dayChange = (Math.random() * 6 - 2).toFixed(2);
  const isPositive = parseFloat(dayChange) >= 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-mesh pb-20 md:pb-0 md:pt-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Market Analysis</h1>
          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select stock" />
            </SelectTrigger>
            <SelectContent>
              {(selectedStocks.length > 0 ? selectedStocks : INDIAN_STOCKS.map(s => s.symbol)).map((symbol) => (
                <SelectItem key={symbol} value={symbol}>
                  {INDIAN_STOCKS.find(s => s.symbol === symbol)?.name || symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">Current Price</span>
              </div>
              <p className="text-2xl font-bold">₹{(Math.random() * 2000 + 500).toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-muted-foreground">Day Change</span>
              </div>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{dayChange}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Volatility</span>
              </div>
              <p className="text-2xl font-bold">2.3%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">RSI</span>
              </div>
              <p className="text-2xl font-bold">68.5</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="price" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="price">Price Chart</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="sector">Sector Analysis</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          </TabsList>

          <TabsContent value="price" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Movement - {selectedStock}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--accent))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="volume" fill="#059669" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar 
                        dataKey="return" 
                        fill="hsl(var(--accent))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sector" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sentimentData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="positive" stackId="a" fill="#059669" />
                      <Bar dataKey="neutral" stackId="a" fill="#F59E0B" />
                      <Bar dataKey="negative" stackId="a" fill="#DC2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <FeedbackWidget screenName="analytics" />
    </div>
  );
};

export default Analytics;