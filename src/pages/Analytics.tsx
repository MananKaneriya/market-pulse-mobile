import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, Area, AreaChart, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, PieChartIcon, LineChartIcon, Zap, Filter, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { INDIAN_STOCKS, FUNDAMENTAL_DATA, IndianStockCompany } from '@/lib/dummyData';
import Navbar from '@/components/Navbar';
import FeedbackWidget from '@/components/FeedbackWidget';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Deterministic stock data mapping - stable across re-renders
const STOCK_ANALYTICS_DATA: Record<string, {
  priceData: { name: string; price: number; volume: number }[];
  metrics: { currentPrice: number; dayChange: number; volatility: number; rsi: number };
  sentiment: { positive: number; neutral: number; negative: number }[];
}> = {
  RELIANCE: {
    priceData: [
      { name: 'Jan', price: 2380, volume: 1250 },
      { name: 'Feb', price: 2420, volume: 1180 },
      { name: 'Mar', price: 2395, volume: 1320 },
      { name: 'Apr', price: 2456, volume: 1400 },
      { name: 'May', price: 2510, volume: 1350 },
    ],
    metrics: { currentPrice: 2456.75, dayChange: 1.88, volatility: 2.1, rsi: 68.5 },
    sentiment: [
      { positive: 68, neutral: 12, negative: 20 },
      { positive: 72, neutral: 10, negative: 18 },
      { positive: 65, neutral: 15, negative: 20 },
      { positive: 70, neutral: 8, negative: 22 },
      { positive: 75, neutral: 10, negative: 15 },
    ],
  },
  TCS: {
    priceData: [
      { name: 'Jan', price: 3750, volume: 980 },
      { name: 'Feb', price: 3820, volume: 1050 },
      { name: 'Mar', price: 3780, volume: 920 },
      { name: 'Apr', price: 3850, volume: 1100 },
      { name: 'May', price: 3890, volume: 1020 },
    ],
    metrics: { currentPrice: 3890.50, dayChange: -0.72, volatility: 1.8, rsi: 55.2 },
    sentiment: [
      { positive: 55, neutral: 25, negative: 20 },
      { positive: 58, neutral: 22, negative: 20 },
      { positive: 52, neutral: 28, negative: 20 },
      { positive: 56, neutral: 24, negative: 20 },
      { positive: 60, neutral: 20, negative: 20 },
    ],
  },
  HDFCBANK: {
    priceData: [
      { name: 'Jan', price: 1620, volume: 1450 },
      { name: 'Feb', price: 1655, volume: 1380 },
      { name: 'Mar', price: 1640, volume: 1520 },
      { name: 'Apr', price: 1668, volume: 1600 },
      { name: 'May', price: 1678, volume: 1480 },
    ],
    metrics: { currentPrice: 1678.25, dayChange: 1.38, volatility: 1.5, rsi: 62.8 },
    sentiment: [
      { positive: 36, neutral: 24, negative: 40 },
      { positive: 38, neutral: 22, negative: 40 },
      { positive: 34, neutral: 26, negative: 40 },
      { positive: 40, neutral: 20, negative: 40 },
      { positive: 42, neutral: 18, negative: 40 },
    ],
  },
  INFY: {
    priceData: [
      { name: 'Jan', price: 1420, volume: 890 },
      { name: 'Feb', price: 1445, volume: 920 },
      { name: 'Mar', price: 1410, volume: 850 },
      { name: 'Apr', price: 1438, volume: 940 },
      { name: 'May', price: 1456, volume: 880 },
    ],
    metrics: { currentPrice: 1456.30, dayChange: -1.06, volatility: 2.4, rsi: 48.3 },
    sentiment: [
      { positive: 42, neutral: 28, negative: 30 },
      { positive: 44, neutral: 26, negative: 30 },
      { positive: 40, neutral: 30, negative: 30 },
      { positive: 45, neutral: 25, negative: 30 },
      { positive: 48, neutral: 22, negative: 30 },
    ],
  },
  ICICIBANK: {
    priceData: [
      { name: 'Jan', price: 1050, volume: 1320 },
      { name: 'Feb', price: 1068, volume: 1280 },
      { name: 'Mar', price: 1055, volume: 1380 },
      { name: 'Apr', price: 1078, volume: 1420 },
      { name: 'May', price: 1089, volume: 1350 },
    ],
    metrics: { currentPrice: 1089.45, dayChange: 1.77, volatility: 1.9, rsi: 64.2 },
    sentiment: [
      { positive: 61, neutral: 19, negative: 20 },
      { positive: 64, neutral: 16, negative: 20 },
      { positive: 58, neutral: 22, negative: 20 },
      { positive: 62, neutral: 18, negative: 20 },
      { positive: 66, neutral: 14, negative: 20 },
    ],
  },
};

// Generate deterministic data for other stocks
const getDeterministicData = (symbol: string) => {
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const basePrice = 500 + (hash % 3000);
  const stock = INDIAN_STOCKS.find(s => s.symbol === symbol);
  
  return {
    priceData: [
      { name: 'Jan', price: basePrice - 50 + (hash % 30), volume: 800 + (hash % 500) },
      { name: 'Feb', price: basePrice - 30 + (hash % 40), volume: 850 + (hash % 450) },
      { name: 'Mar', price: basePrice - 40 + (hash % 35), volume: 780 + (hash % 520) },
      { name: 'Apr', price: basePrice - 10 + (hash % 25), volume: 900 + (hash % 400) },
      { name: 'May', price: basePrice + (hash % 20), volume: 870 + (hash % 480) },
    ],
    metrics: {
      currentPrice: stock?.currentPrice || basePrice,
      dayChange: stock?.changePercent || ((hash % 600) - 200) / 100,
      volatility: 1.5 + (hash % 20) / 10,
      rsi: 40 + (hash % 35),
    },
    sentiment: [
      { positive: 40 + (hash % 30), neutral: 15 + (hash % 20), negative: 100 - (40 + (hash % 30)) - (15 + (hash % 20)) },
      { positive: 42 + (hash % 28), neutral: 14 + (hash % 18), negative: 100 - (42 + (hash % 28)) - (14 + (hash % 18)) },
      { positive: 38 + (hash % 32), neutral: 16 + (hash % 22), negative: 100 - (38 + (hash % 32)) - (16 + (hash % 22)) },
      { positive: 44 + (hash % 26), neutral: 12 + (hash % 16), negative: 100 - (44 + (hash % 26)) - (12 + (hash % 16)) },
      { positive: 46 + (hash % 24), neutral: 13 + (hash % 17), negative: 100 - (46 + (hash % 24)) - (13 + (hash % 17)) },
    ],
  };
};

const getStockData = (symbol: string) => {
  return STOCK_ANALYTICS_DATA[symbol] || getDeterministicData(symbol);
};

// Chart colors
const CHART_COLORS = [
  'hsl(162, 72%, 45%)',  // accent/green
  'hsl(220, 90%, 56%)',  // primary/blue
  'hsl(262, 83%, 58%)',  // purple
  'hsl(38, 92%, 50%)',   // gold
  'hsl(192, 91%, 48%)',  // cyan
  'hsl(0, 84%, 60%)',    // red
  'hsl(280, 65%, 60%)',  // violet
  'hsl(45, 93%, 47%)',   // amber
];

const SECTOR_COLORS: Record<string, string> = {
  'Information Technology': 'hsl(220, 90%, 56%)',
  'Banking & Finance': 'hsl(162, 72%, 45%)',
  'Energy & Conglomerate': 'hsl(38, 92%, 50%)',
  'FMCG': 'hsl(262, 83%, 58%)',
  'Telecommunications': 'hsl(192, 91%, 48%)',
  'Infrastructure': 'hsl(0, 84%, 60%)',
  'Consumer Durables': 'hsl(280, 65%, 60%)',
  'Automobile': 'hsl(45, 93%, 47%)',
  'Healthcare': 'hsl(152, 76%, 42%)',
};

const Analytics = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [visibleStocks, setVisibleStocks] = useState<string[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

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

  const fetchUserStocks = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_stock_selections')
      .select('stock_symbol')
      .eq('user_id', user.id);

    if (data && data.length > 0) {
      const stocks = data.map(d => d.stock_symbol);
      setSelectedStocks(stocks);
      setVisibleStocks(stocks); // Initially all stocks are visible
    } else {
      // Default stocks if none selected
      const defaultStocks = ['RELIANCE', 'TCS', 'HDFCBANK'];
      setSelectedStocks(defaultStocks);
      setVisibleStocks(defaultStocks);
    }
  };

  // Toggle a stock's visibility in charts
  const toggleStockVisibility = useCallback((symbol: string) => {
    setVisibleStocks(prev => {
      if (prev.includes(symbol)) {
        // Don't allow removing all stocks
        if (prev.length === 1) return prev;
        return prev.filter(s => s !== symbol);
      }
      return [...prev, symbol];
    });
  }, []);

  // Select all stocks
  const selectAllStocks = useCallback(() => {
    setVisibleStocks(selectedStocks);
  }, [selectedStocks]);

  // Clear to single stock (keep first one)
  const selectSingleStock = useCallback(() => {
    if (selectedStocks.length > 0) {
      setVisibleStocks([selectedStocks[0]]);
    }
  }, [selectedStocks]);

  // Compute aggregated metrics - based on VISIBLE stocks
  const aggregatedMetrics = useMemo(() => {
    if (visibleStocks.length === 0) return null;

    const stocksData = visibleStocks.map(symbol => ({
      symbol,
      ...getStockData(symbol),
      info: INDIAN_STOCKS.find(s => s.symbol === symbol),
    }));

    const totalValue = stocksData.reduce((sum, s) => sum + s.metrics.currentPrice, 0);
    const avgDayChange = stocksData.reduce((sum, s) => sum + s.metrics.dayChange, 0) / stocksData.length;
    const avgVolatility = stocksData.reduce((sum, s) => sum + s.metrics.volatility, 0) / stocksData.length;
    const avgRSI = stocksData.reduce((sum, s) => sum + s.metrics.rsi, 0) / stocksData.length;

    return {
      totalValue: totalValue / stocksData.length, // Average price
      avgDayChange,
      avgVolatility,
      avgRSI,
      stocksData,
    };
  }, [visibleStocks]);

  // Combined price chart data - based on VISIBLE stocks
  const combinedPriceData = useMemo(() => {
    if (visibleStocks.length === 0) return [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    return months.map((month, idx) => {
      const entry: Record<string, any> = { name: month };
      visibleStocks.forEach(symbol => {
        const data = getStockData(symbol);
        entry[symbol] = data.priceData[idx]?.price || 0;
        entry[`${symbol}_volume`] = data.priceData[idx]?.volume || 0;
      });
      return entry;
    });
  }, [visibleStocks]);

  // Portfolio performance data - based on VISIBLE stocks
  const portfolioData = useMemo(() => {
    return visibleStocks.map((symbol, idx) => {
      const data = getStockData(symbol);
      const stock = INDIAN_STOCKS.find(s => s.symbol === symbol);
      return {
        name: symbol,
        fullName: stock?.name || symbol,
        return: data.metrics.dayChange,
        price: data.metrics.currentPrice,
        fill: CHART_COLORS[idx % CHART_COLORS.length],
      };
    });
  }, [visibleStocks]);

  // Sector allocation data - based on VISIBLE stocks
  const sectorData = useMemo(() => {
    const sectorMap: Record<string, number> = {};
    visibleStocks.forEach(symbol => {
      const stock = INDIAN_STOCKS.find(s => s.symbol === symbol);
      if (stock) {
        sectorMap[stock.sector] = (sectorMap[stock.sector] || 0) + 1;
      }
    });

    const total = visibleStocks.length;
    return Object.entries(sectorMap).map(([sector, count]) => ({
      name: sector,
      value: Math.round((count / total) * 100),
      color: SECTOR_COLORS[sector] || 'hsl(220, 10%, 50%)',
    }));
  }, [visibleStocks]);

  // Sentiment trend data - based on VISIBLE stocks
  const sentimentTrendData = useMemo(() => {
    if (visibleStocks.length === 0) return [];

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days.map((day, idx) => {
      let positive = 0, neutral = 0, negative = 0;
      visibleStocks.forEach(symbol => {
        const data = getStockData(symbol);
        if (data.sentiment[idx]) {
          positive += data.sentiment[idx].positive;
          neutral += data.sentiment[idx].neutral;
          negative += data.sentiment[idx].negative;
        }
      });
      const count = visibleStocks.length;
      return {
        name: day,
        positive: Math.round(positive / count),
        neutral: Math.round(neutral / count),
        negative: Math.round(negative / count),
      };
    });
  }, [visibleStocks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const isPortfolioPositive = (aggregatedMetrics?.avgDayChange ?? 0) >= 0;

  return (
    <div className="min-h-screen bg-background bg-mesh pb-20 md:pb-0 md:pt-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
              Market Analytics
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {visibleStocks.length}/{selectedStocks.length} Stocks Visible
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground">
            {visibleStocks.length > 1 
              ? 'Comparative analysis across selected stocks'
              : visibleStocks.length === 1 
                ? `Detailed analysis for ${INDIAN_STOCKS.find(s => s.symbol === visibleStocks[0])?.name || visibleStocks[0]}`
                : 'Select stocks to view analytics'}
          </p>
        </div>

        {/* Stock Filter Controls */}
        <Card className="glass mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg">Stock Filter</CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {visibleStocks.length} selected
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllStocks}
                  disabled={visibleStocks.length === selectedStocks.length}
                  className="text-xs"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Show All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectSingleStock}
                  disabled={visibleStocks.length === 1}
                  className="text-xs"
                >
                  <EyeOff className="h-3.5 w-3.5 mr-1" />
                  Single Stock
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className="ml-2"
                >
                  {isFilterExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <CardDescription>
              Toggle individual stocks to customize your comparison view
            </CardDescription>
          </CardHeader>
          {isFilterExpanded && (
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {selectedStocks.map((symbol, idx) => {
                  const stock = INDIAN_STOCKS.find(s => s.symbol === symbol);
                  const data = getStockData(symbol);
                  const isPositive = data.metrics.dayChange >= 0;
                  const isVisible = visibleStocks.includes(symbol);
                  
                  return (
                    <div 
                      key={symbol}
                      onClick={() => toggleStockVisibility(symbol)}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                        ${isVisible 
                          ? 'bg-card border-accent/50 shadow-sm' 
                          : 'bg-muted/30 border-border/50 opacity-60 hover:opacity-80'
                        }
                      `}
                    >
                      <Checkbox 
                        checked={isVisible}
                        onCheckedChange={() => toggleStockVisibility(symbol)}
                        className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                          />
                          <span className="font-medium text-sm truncate">{symbol}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-muted-foreground truncate">
                            {stock?.name?.split(' ')[0] || symbol}
                          </span>
                          <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}{data.metrics.dayChange.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="glass hover-lift">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {visibleStocks.length > 1 ? 'Avg Price' : 'Current Price'}
                </span>
              </div>
              <p className="text-2xl font-bold">
                ₹{aggregatedMetrics?.totalValue.toFixed(2) || '0.00'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover-lift">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isPortfolioPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {isPortfolioPositive ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {visibleStocks.length > 1 ? 'Avg Change' : 'Day Change'}
                </span>
              </div>
              <p className={`text-2xl font-bold ${isPortfolioPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPortfolioPositive ? '+' : ''}{aggregatedMetrics?.avgDayChange.toFixed(2) || '0.00'}%
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover-lift">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {visibleStocks.length > 1 ? 'Avg Volatility' : 'Volatility'}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {aggregatedMetrics?.avgVolatility.toFixed(1) || '0.0'}%
              </p>
            </CardContent>
          </Card>

          <Card className="glass hover-lift">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Zap className="h-5 w-5 text-amber-500" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {visibleStocks.length > 1 ? 'Avg RSI' : 'RSI'}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {aggregatedMetrics?.avgRSI.toFixed(1) || '0.0'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="price" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/50 p-1 rounded-xl">
            <TabsTrigger value="price" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <LineChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Price Chart</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="sector" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Sectors</span>
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Sentiment</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="price" className="space-y-6">
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-accent" />
                  Price Movement
                </CardTitle>
                <CardDescription>
                  {visibleStocks.length > 1 
                    ? 'Comparative price trends across selected stocks'
                    : `Price trend for ${visibleStocks[0] || 'selected stock'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={combinedPriceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: 'var(--shadow-elevated)',
                        }}
                        formatter={(value: number) => [`₹${value.toFixed(2)}`, '']}
                      />
                      <Legend />
                      {visibleStocks.map((symbol, idx) => (
                        <Line 
                          key={symbol}
                          type="monotone" 
                          dataKey={symbol} 
                          stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                          strokeWidth={2}
                          dot={{ fill: CHART_COLORS[idx % CHART_COLORS.length], strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Volume Analysis
                </CardTitle>
                <CardDescription>Trading volume comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={combinedPriceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: 'var(--shadow-elevated)',
                        }}
                      />
                      <Legend />
                      {visibleStocks.map((symbol, idx) => (
                        <Bar 
                          key={symbol}
                          dataKey={`${symbol}_volume`}
                          name={symbol}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                          radius={[4, 4, 0, 0]}
                          opacity={0.85}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    Returns Comparison
                  </CardTitle>
                  <CardDescription>Day change % by stock</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={portfolioData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={true} vertical={false} />
                        <XAxis 
                          type="number"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <YAxis 
                          type="category"
                          dataKey="name" 
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          width={80}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-elevated)',
                          }}
                          formatter={(value: number) => [`${value.toFixed(2)}%`, 'Return']}
                        />
                        <Bar 
                          dataKey="return" 
                          radius={[0, 4, 4, 0]}
                        >
                          {portfolioData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.return >= 0 ? 'hsl(152, 76%, 42%)' : 'hsl(0, 84%, 60%)'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Price Distribution
                  </CardTitle>
                  <CardDescription>Current prices across portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={portfolioData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis 
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-elevated)',
                          }}
                          formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
                        />
                        <Bar 
                          dataKey="price"
                          radius={[4, 4, 0, 0]}
                        >
                          {portfolioData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stock Details Table */}
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle>Portfolio Overview</CardTitle>
                <CardDescription>Detailed metrics for each stock</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Change</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Volatility</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">RSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleStocks.map((symbol, idx) => {
                        const data = getStockData(symbol);
                        const stock = INDIAN_STOCKS.find(s => s.symbol === symbol);
                        const isPositive = data.metrics.dayChange >= 0;
                        return (
                          <tr key={symbol} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                />
                                <div>
                                  <p className="font-medium">{symbol}</p>
                                  <p className="text-xs text-muted-foreground">{stock?.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4 font-medium">₹{data.metrics.currentPrice.toFixed(2)}</td>
                            <td className={`text-right py-3 px-4 font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                              {isPositive ? '+' : ''}{data.metrics.dayChange.toFixed(2)}%
                            </td>
                            <td className="text-right py-3 px-4">{data.metrics.volatility.toFixed(1)}%</td>
                            <td className="text-right py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                data.metrics.rsi > 70 ? 'bg-red-500/10 text-red-500' :
                                data.metrics.rsi < 30 ? 'bg-green-500/10 text-green-500' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {data.metrics.rsi.toFixed(1)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sector" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-accent" />
                    Sector Allocation
                  </CardTitle>
                  <CardDescription>Distribution by industry sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectorData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${value}%`}
                          labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                        >
                          {sectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-elevated)',
                          }}
                          formatter={(value: number) => [`${value}%`, 'Allocation']}
                        />
                        <Legend 
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Sector Breakdown
                  </CardTitle>
                  <CardDescription>Allocation percentage by sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-4">
                    {sectorData.map((sector, idx) => (
                      <div key={sector.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate max-w-[200px]">{sector.name}</span>
                          <span className="text-sm text-muted-foreground">{sector.value}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${sector.value}%`,
                              backgroundColor: sector.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6">
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  Sentiment Trend
                </CardTitle>
                <CardDescription>
                  {selectedStocks.length > 1 
                    ? 'Aggregated social media sentiment across your portfolio'
                    : `Social media sentiment for ${selectedStocks[0] || 'selected stock'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sentimentTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: 'var(--shadow-elevated)',
                        }}
                        formatter={(value: number) => [`${value}%`, '']}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="positive" 
                        stackId="1" 
                        stroke="hsl(152, 76%, 42%)" 
                        fill="hsl(152, 76%, 42%)"
                        fillOpacity={0.6}
                        name="Positive"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="neutral" 
                        stackId="1" 
                        stroke="hsl(38, 92%, 50%)" 
                        fill="hsl(38, 92%, 50%)"
                        fillOpacity={0.6}
                        name="Neutral"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="negative" 
                        stackId="1" 
                        stroke="hsl(0, 84%, 60%)" 
                        fill="hsl(0, 84%, 60%)"
                        fillOpacity={0.6}
                        name="Negative"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Individual Stock Sentiment */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedStocks.slice(0, 6).map((symbol, idx) => {
                const data = getStockData(symbol);
                const avgPositive = Math.round(data.sentiment.reduce((sum, s) => sum + s.positive, 0) / data.sentiment.length);
                const avgNeutral = Math.round(data.sentiment.reduce((sum, s) => sum + s.neutral, 0) / data.sentiment.length);
                const avgNegative = Math.round(data.sentiment.reduce((sum, s) => sum + s.negative, 0) / data.sentiment.length);
                const sentiment = avgPositive > 55 ? 'Bullish' : avgPositive < 45 ? 'Bearish' : 'Neutral';
                
                return (
                  <Card key={symbol} className="glass">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                          />
                          <span className="font-semibold">{symbol}</span>
                        </div>
                        <Badge 
                          variant={sentiment === 'Bullish' ? 'default' : sentiment === 'Bearish' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {sentiment}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-500">Positive</span>
                          <span className="font-medium">{avgPositive}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${avgPositive}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-amber-500">Neutral</span>
                          <span className="font-medium">{avgNeutral}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${avgNeutral}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-red-500">Negative</span>
                          <span className="font-medium">{avgNegative}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${avgNegative}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <FeedbackWidget screenName="analytics" />
    </div>
  );
};

export default Analytics;
