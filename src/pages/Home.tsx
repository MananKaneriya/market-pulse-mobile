import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Share, Bookmark, TrendingUp, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import FeedbackWidget from '@/components/FeedbackWidget';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DAILY_TIPS } from '@/lib/dummyData';

interface StockSummary {
  id: string;
  ticker: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  likes: number;
  isBookmarked: boolean;
}

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<StockSummary[]>([]);
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState(DAILY_TIPS[0]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTip(true);
      const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
      setCurrentTip(randomTip);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserStocks();
      fetchBookmarks();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStocks.length > 0) {
      fetchSummaries();
    }
  }, [selectedStocks]);

  const fetchUserStocks = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_stock_selections')
      .select('stock_symbol')
      .eq('user_id', user.id);

    if (data) {
      setSelectedStocks(data.map(d => d.stock_symbol));
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('bookmarks')
      .select('article_id')
      .eq('user_id', user.id);

    if (data) {
      setBookmarkedIds(data.map(d => d.article_id));
    }
  };

  const fetchSummaries = async () => {
    if (selectedStocks.length === 0) return;
    
    setIsLoadingSummaries(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { stocks: selectedStocks.slice(0, 15) }
      });

      if (error) {
        console.error('Error fetching summaries:', error);
        toast.error('Failed to load market summaries');
        return;
      }

      if (data?.summaries && Array.isArray(data.summaries)) {
        const formattedSummaries: StockSummary[] = data.summaries.map((item: any, index: number) => ({
          id: `summary-${item.ticker}-${Date.now()}-${index}`,
          ticker: item.ticker,
          summary: item.summary,
          sentiment: determineSentiment(item.summary),
          timestamp: 'Just now',
          likes: Math.floor(Math.random() * 100),
          isBookmarked: bookmarkedIds.includes(`summary-${item.ticker}`)
        }));
        setSummaries(formattedSummaries);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to generate summaries');
    } finally {
      setIsLoadingSummaries(false);
    }
  };

  const determineSentiment = (summary: string): 'positive' | 'negative' | 'neutral' => {
    const positiveWords = ['growth', 'bullish', 'gain', 'positive', 'strong', 'upward', 'optimistic', 'rally', 'surge'];
    const negativeWords = ['decline', 'bearish', 'loss', 'negative', 'weak', 'downward', 'pessimistic', 'drop', 'fall'];
    
    const lowerSummary = summary.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerSummary.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerSummary.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  const handleLike = (id: string) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(id)) {
        newLiked.delete(id);
      } else {
        newLiked.add(id);
      }
      return newLiked;
    });

    setSummaries(prev => prev.map(item => 
      item.id === id 
        ? { ...item, likes: likedPosts.has(id) ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const handleBookmark = async (id: string) => {
    if (!user) return;

    const item = summaries.find(s => s.id === id);
    if (!item) return;

    if (item.isBookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', id);
      toast.success('Removed from bookmarks');
    } else {
      await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          article_id: id,
          article_title: `${item.ticker} Market Summary`,
          article_summary: item.summary,
          article_source: 'MarketPulse AI',
        });
      toast.success('Added to bookmarks');
    }

    setSummaries(prev => prev.map(s => 
      s.id === id ? { ...s, isBookmarked: !s.isBookmarked } : s
    ));
  };

  const handleShare = (item: StockSummary) => {
    if (navigator.share) {
      navigator.share({
        title: `${item.ticker} Market Summary`,
        text: item.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${item.ticker} Market Summary\n\n${item.summary}`);
      toast.success('Copied to clipboard');
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-fintech-green';
      case 'negative': return 'text-fintech-red';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-fintech-green/10 border-fintech-green/20';
      case 'negative': return 'bg-fintech-red/10 border-fintech-red/20';
      default: return 'bg-muted border-border';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4 md:pt-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Welcome Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to MarketPulse</h1>
            <p className="text-muted-foreground">AI-powered market summaries for your stocks</p>
          </div>
          {selectedStocks.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSummaries}
              disabled={isLoadingSummaries}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingSummaries ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>

        {selectedStocks.length === 0 && (
          <Card className="mb-6 p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground text-center">
              You haven't selected any stocks yet.{' '}
              <button
                onClick={() => navigate('/onboarding')}
                className="text-accent hover:underline"
              >
                Choose your stocks
              </button>
            </p>
          </Card>
        )}

        {/* Loading State */}
        {isLoadingSummaries && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded"></div>
                      <div className="h-3 w-16 bg-muted rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-3/4 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summaries Feed */}
        {!isLoadingSummaries && (
          <div className="space-y-6">
            {summaries.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-fintech-blue rounded-full flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">${item.ticker}</p>
                          <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs border ${getSentimentBg(item.sentiment)}`}>
                        <span className={getSentimentColor(item.sentiment)}>
                          {item.sentiment.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.ticker} Market Summary</h3>
                    <p className="text-muted-foreground">{item.summary}</p>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(item.id)}
                          className={`hover:bg-fintech-red/10 ${likedPosts.has(item.id) ? 'text-fintech-red' : ''}`}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${likedPosts.has(item.id) ? 'fill-current' : ''}`} />
                          {item.likes}
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="hover:bg-fintech-blue/10">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          0
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleShare(item)}
                          className="hover:bg-fintech-green/10"
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(item.id)}
                        className={`hover:bg-fintech-gold/10 ${item.isBookmarked ? 'text-fintech-gold' : ''}`}
                      >
                        <Bookmark className={`h-4 w-4 ${item.isBookmarked ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoadingSummaries && summaries.length === 0 && selectedStocks.length > 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No summaries loaded yet. Click refresh to generate AI summaries.
            </p>
            <Button onClick={fetchSummaries} disabled={isLoadingSummaries}>
              Generate Summaries
            </Button>
          </Card>
        )}
      </div>

      {/* Daily Tip Popup */}
      {showTip && (
        <div className="fixed bottom-24 left-4 right-4 md:right-auto md:max-w-sm z-50 animate-slide-up">
          <Card className="bg-fintech-gold shadow-lg border-fintech-gold/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-primary-foreground">💡 Daily Tip</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTip(false)}
                  className="text-primary-foreground hover:bg-primary-foreground/20 p-1 h-auto"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-primary-foreground/90">{currentTip}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <FeedbackWidget screenName="home_feed" />
    </div>
  );
};

export default Home;
