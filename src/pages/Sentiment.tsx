import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FeedbackWidget from '@/components/FeedbackWidget';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { INDIAN_STOCKS } from '@/lib/dummyData';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type OverallSentimentLabel = 'Bullish' | 'Moderately Bullish' | 'Neutral' | 'Bearish';

type StockSentimentData = {
  positive: number;
  neutral: number;
  negative: number;
  overall: OverallSentimentLabel;
  summary: string;
};

const STOCK_DATA_MAP: Record<string, StockSentimentData> = {
  RELIANCE: {
    positive: 68,
    neutral: 4,
    negative: 28,
    overall: 'Bullish',
    summary: 'Reliance Industries continues to show strong momentum with robust quarterly results. The conglomerate\'s diversified portfolio spanning energy, retail, and telecommunications provides solid fundamentals. Investor sentiment remains overwhelmingly positive as the company expands its renewable energy initiatives. Recent strategic partnerships and digital transformation efforts have boosted market confidence. Analysts maintain buy ratings citing strong cash flows and growth prospects.'
  },
  TCS: {
    positive: 55,
    neutral: 15,
    negative: 30,
    overall: 'Moderately Bullish',
    summary: 'Tata Consultancy Services maintains stable performance despite global IT spending concerns. The company\'s strong order book and diversified client base provide resilience. Digital transformation deals continue to drive growth, though margins face pressure from talent costs. Recent contract wins in cloud and AI services signal future opportunities. Investors remain cautiously optimistic about medium-term growth prospects despite near-term headwinds.'
  },
  INFY: {
    positive: 42,
    neutral: 18,
    negative: 40,
    overall: 'Neutral',
    summary: 'Infosys faces mixed market sentiment as growth guidance remains conservative. The IT major navigates challenging macro conditions with focus on operational efficiency. Client spending patterns show signs of stabilization but discretionary deals remain slow. The company\'s AI and automation capabilities position it well for future demand. Market watchers await clearer growth signals before turning decisively bullish or bearish on the stock.'
  },
  HDFCBANK: {
    positive: 36,
    neutral: 14,
    negative: 50,
    overall: 'Bearish',
    summary: 'HDFC Bank experiences headwinds following merger integration challenges. The banking giant faces pressure on net interest margins amid competitive deposit rate environment. Credit growth remains steady but concerns persist about asset quality in certain segments. The stock trades at subdued valuations reflecting near-term uncertainties. Analysts suggest waiting for clarity on integration synergies before accumulating positions.'
  },
  ICICIBANK: {
    positive: 61,
    neutral: 9,
    negative: 30,
    overall: 'Bullish',
    summary: 'ICICI Bank demonstrates strong operational metrics with improving asset quality trends. The private sector lender shows robust loan growth across retail and corporate segments. Digital banking initiatives drive cost efficiencies and customer acquisition. Recent quarterly results exceeded market expectations on most parameters. Investors remain positive on the bank\'s execution capabilities and growth trajectory in the current credit cycle.'
  },
};

const clampInt = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));

const normalizeStockKey = (raw: string) =>
  raw
    .toUpperCase()
    .trim()
    .replace(/\.NS$/i, '')
    .replace(/[^A-Z0-9]/g, '');

const hashString = (str: string) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash) >>> 0;
};

const deterministicSentimentFromKey = (key: string): StockSentimentData => {
  const h = hashString(key);

  let positive = 30 + (h % 41);
  let neutral = 5 + (Math.floor(h / 41) % 21);
  let negative = 100 - positive - neutral;

  if (negative < 5) {
    const deficit = 5 - negative;
    negative = 5;
    const takeFromNeutral = Math.min(deficit, Math.max(0, neutral - 5));
    neutral -= takeFromNeutral;
    positive -= deficit - takeFromNeutral;
  }

  positive = clampInt(positive, 10, 80);
  neutral = clampInt(neutral, 0, 40);
  negative = 100 - positive - neutral;

  if (negative < 0) {
    neutral = clampInt(neutral + negative, 0, 40);
    negative = 100 - positive - neutral;
  }

  const overall: OverallSentimentLabel =
    negative >= 50
      ? 'Bearish'
      : positive >= 60
        ? 'Bullish'
        : positive >= 50
          ? 'Moderately Bullish'
          : 'Neutral';

  const stockName = key.charAt(0) + key.slice(1).toLowerCase();
  const summary = `${stockName} shows ${overall.toLowerCase()} market sentiment with ${positive}% positive social mentions. Market participants are actively discussing the stock with mixed opinions. Technical indicators suggest ${overall === 'Bullish' || overall === 'Moderately Bullish' ? 'upward momentum' : overall === 'Bearish' ? 'downward pressure' : 'consolidation'}. Investors should monitor upcoming earnings and sector developments for clearer direction signals.`;

  return { positive, neutral, negative, overall, summary };
};

const getStockSentimentData = (stockSymbolOrName: string): StockSentimentData => {
  const key = normalizeStockKey(stockSymbolOrName);
  return STOCK_DATA_MAP[key] ?? deterministicSentimentFromKey(key);
};

const getSentimentColorClasses = (overall: OverallSentimentLabel) => {
  switch (overall) {
    case 'Bullish':
      return 'border-green-500/30 bg-green-500/5';
    case 'Moderately Bullish':
      return 'border-emerald-500/30 bg-emerald-500/5';
    case 'Bearish':
      return 'border-red-500/30 bg-red-500/5';
    default:
      return 'border-muted bg-muted/20';
  }
};

const getSentimentBadgeClasses = (overall: OverallSentimentLabel) => {
  switch (overall) {
    case 'Bullish':
      return 'bg-green-500/20 text-green-600 dark:text-green-400';
    case 'Moderately Bullish':
      return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
    case 'Bearish':
      return 'bg-red-500/20 text-red-600 dark:text-red-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

interface StockSentimentCardProps {
  symbol: string;
  data: StockSentimentData;
}

const StockSentimentCard = ({ symbol, data }: StockSentimentCardProps) => {
  const stockInfo = INDIAN_STOCKS.find(s => s.symbol === symbol);
  const stockName = stockInfo?.name || symbol;

  return (
    <Card className={`p-5 border-2 transition-all ${getSentimentColorClasses(data.overall)}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">{symbol}</h3>
          <p className="text-sm text-muted-foreground">{stockName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSentimentBadgeClasses(data.overall)}`}>
          {data.overall}
        </span>
      </div>

      {/* Sentiment Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-green-600 dark:text-green-400 font-medium">Positive {data.positive}%</span>
          <span className="text-muted-foreground font-medium">Neutral {data.neutral}%</span>
          <span className="text-red-600 dark:text-red-400 font-medium">Negative {data.negative}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-green-500 to-green-400 transition-all"
            style={{ width: `${data.positive}%` }}
          />
          <div
            className="bg-muted-foreground/30 transition-all"
            style={{ width: `${data.neutral}%` }}
          />
          <div
            className="bg-gradient-to-r from-red-400 to-red-500 transition-all"
            style={{ width: `${data.negative}%` }}
          />
        </div>
      </div>

      {/* Sentiment Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded bg-green-500/10">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{data.positive}%</p>
          <p className="text-xs text-muted-foreground">Positive</p>
        </div>
        <div className="text-center p-2 rounded bg-muted/50">
          <Minus className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-bold">{data.neutral}%</p>
          <p className="text-xs text-muted-foreground">Neutral</p>
        </div>
        <div className="text-center p-2 rounded bg-red-500/10">
          <TrendingDown className="w-4 h-4 mx-auto mb-1 text-red-500" />
          <p className="text-lg font-bold text-red-600 dark:text-red-400">{data.negative}%</p>
          <p className="text-xs text-muted-foreground">Negative</p>
        </div>
      </div>

      {/* Summary */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          AI Summary
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
      </div>
    </Card>
  );
};

const Sentiment = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Create a stable map of stock -> sentiment data
  const stockSentimentMap = useMemo(() => {
    const map: Record<string, StockSentimentData> = {};
    selectedStocks.forEach(symbol => {
      map[symbol] = getStockSentimentData(symbol);
    });
    return map;
  }, [selectedStocks]);

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
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('user_stock_selections')
        .select('stock_symbol')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setSelectedStocks(data.map(d => d.stock_symbol));
      } else {
        // Default stocks if none selected
        setSelectedStocks(['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK']);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast({
        title: 'Error loading stocks',
        description: 'Using default stock selections.',
        variant: 'destructive',
      });
      setSelectedStocks(['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK']);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading sentiment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-mesh pb-20 md:pb-4 md:pt-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Social Sentiment Analysis</h1>
          <p className="text-muted-foreground">
            Track public opinion and AI-generated summaries for your {selectedStocks.length} selected stocks
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-4 bg-gradient-success text-success-foreground">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Bullish Stocks</span>
            </div>
            <p className="text-2xl font-bold">
              {Object.values(stockSentimentMap).filter(s => s.overall === 'Bullish').length}
            </p>
          </Card>
          <Card className="p-4 bg-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium">Moderately Bullish</span>
            </div>
            <p className="text-2xl font-bold">
              {Object.values(stockSentimentMap).filter(s => s.overall === 'Moderately Bullish').length}
            </p>
          </Card>
          <Card className="p-4 bg-muted">
            <div className="flex items-center gap-2 mb-1">
              <Minus className="w-4 h-4" />
              <span className="text-sm font-medium">Neutral</span>
            </div>
            <p className="text-2xl font-bold">
              {Object.values(stockSentimentMap).filter(s => s.overall === 'Neutral').length}
            </p>
          </Card>
          <Card className="p-4 bg-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Bearish Stocks</span>
            </div>
            <p className="text-2xl font-bold">
              {Object.values(stockSentimentMap).filter(s => s.overall === 'Bearish').length}
            </p>
          </Card>
        </div>

        {/* Individual Stock Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {selectedStocks.map(symbol => (
            <StockSentimentCard
              key={symbol}
              symbol={symbol}
              data={stockSentimentMap[symbol]}
            />
          ))}
        </div>

        {selectedStocks.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No stocks selected in your portfolio.</p>
            <p className="text-sm text-muted-foreground">
              Add stocks from the Onboarding page to see sentiment analysis.
            </p>
          </Card>
        )}
      </main>

      <FeedbackWidget screenName="sentiment" />
    </div>
  );
};

export default Sentiment;
