import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FeedbackWidget from '@/components/FeedbackWidget';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DUMMY_TWEETS, INDIAN_STOCKS } from '@/lib/dummyData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SentimentResult {
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

const Sentiment = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [sentimentResults, setSentimentResults] = useState<SentimentResult[]>([]);
  const [analyzingTweets, setAnalyzingTweets] = useState(false);
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

  const analyzeSentiment = async () => {
    setAnalyzingTweets(true);
    try {
      const tweetTexts = tweets.map(t => t.text);
      
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: { texts: tweetTexts }
      });

      if (error) throw error;

      if (data?.results) {
        setSentimentResults(data.results);
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      toast({
        title: 'Sentiment analysis failed',
        description: 'Could not analyze tweets. Using placeholder data.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzingTweets(false);
    }
  };

  useEffect(() => {
    if (user) {
      analyzeSentiment();
    }
  }, [selectedStock, user]);

  const tweets = DUMMY_TWEETS.slice(0, 3);

  // Calculate sentiment percentages from AI results
  const sentimentData = sentimentResults.length > 0 
    ? {
        positive: Math.round((sentimentResults.filter(r => r.sentiment === 'positive').length / sentimentResults.length) * 100),
        neutral: Math.round((sentimentResults.filter(r => r.sentiment === 'neutral').length / sentimentResults.length) * 100),
        negative: Math.round((sentimentResults.filter(r => r.sentiment === 'negative').length / sentimentResults.length) * 100),
      }
    : { positive: 65, neutral: 25, negative: 10 };

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4" />;
      case 'negative': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const overallSentiment = sentimentData.positive > 50 ? 'Bullish' : 
                          sentimentData.negative > 50 ? 'Bearish' : 'Neutral';

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
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Social Sentiment</h1>
          <p className="text-muted-foreground">Track public opinion on your stocks</p>
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

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="p-4 bg-gradient-success text-success-foreground">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Positive</span>
            </div>
            <p className="text-3xl font-bold">{sentimentData.positive}%</p>
          </Card>

          <Card className="p-4 bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <Minus className="w-5 h-5" />
              <span className="font-semibold">Neutral</span>
            </div>
            <p className="text-3xl font-bold">{sentimentData.neutral}%</p>
          </Card>

          <Card className="p-4 bg-destructive/90 text-destructive-foreground">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5" />
              <span className="font-semibold">Negative</span>
            </div>
            <p className="text-3xl font-bold">{sentimentData.negative}%</p>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">AI Sentiment Analysis</h2>
            {analyzingTweets && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
          </div>
          <div className="w-full bg-muted rounded-full h-8 overflow-hidden flex">
            <div
              className="bg-gradient-success flex items-center justify-center text-success-foreground text-xs font-medium transition-all"
              style={{ width: `${sentimentData.positive}%` }}
            >
              {sentimentData.positive}%
            </div>
            <div
              className="bg-muted-foreground/20 flex items-center justify-center text-xs font-medium transition-all"
              style={{ width: `${sentimentData.neutral}%` }}
            >
              {sentimentData.neutral}%
            </div>
            <div
              className="bg-destructive flex items-center justify-center text-destructive-foreground text-xs font-medium transition-all"
              style={{ width: `${sentimentData.negative}%` }}
            >
              {sentimentData.negative}%
            </div>
          </div>
          
          <div className="mt-6 prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              <strong>Overall Sentiment: {overallSentiment}</strong>
            </p>
            <p className="text-muted-foreground">
              {analyzingTweets ? (
                'Analyzing social media sentiment using AI...'
              ) : (
                <>
                  Social media sentiment for <strong>{selectedStock}</strong> shows {sentimentData.positive}% positive mentions, 
                  {sentimentData.neutral}% neutral, and {sentimentData.negative}% negative. 
                  AI analysis indicates {overallSentiment.toLowerCase()} market sentiment based on recent social media activity.
                </>
              )}
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Social Mentions</h2>
          {tweets.map((tweet, index) => {
            const sentiment = sentimentResults[index];
            return (
              <Card key={tweet.id} className="p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-accent"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{tweet.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(tweet.timestamp).toLocaleTimeString()}
                      </span>
                      {sentiment && (
                        <div className={`flex items-center gap-1 ml-auto ${getSentimentColor(sentiment.sentiment)}`}>
                          {getSentimentIcon(sentiment.sentiment)}
                          <span className="text-xs font-medium capitalize">
                            {sentiment.sentiment}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm mb-2">{tweet.text}</p>
                    <div className="text-xs text-muted-foreground">
                      ❤️ {tweet.likes} likes
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <FeedbackWidget screenName="sentiment" />
    </div>
  );
};

export default Sentiment;
