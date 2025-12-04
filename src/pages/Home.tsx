import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Share, Bookmark, TrendingUp, X } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import FeedbackWidget from '@/components/FeedbackWidget';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DUMMY_NEWS_ARTICLES, DAILY_TIPS, type NewsItem } from '@/lib/dummyData';

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState<NewsItem[]>(DUMMY_NEWS_ARTICLES);
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState(DAILY_TIPS[0]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Show daily tip after 2 seconds
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
      const bookmarkedIds = data.map(d => d.article_id);
      setNewsItems(prev => prev.map(item => ({
        ...item,
        isBookmarked: bookmarkedIds.includes(item.id)
      })));
    }
  };

  const handleLike = (newsId: string) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(newsId)) {
        newLiked.delete(newsId);
      } else {
        newLiked.add(newsId);
      }
      return newLiked;
    });

    setNewsItems(prev => prev.map(item => 
      item.id === newsId 
        ? { ...item, likes: likedPosts.has(newsId) ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const handleBookmark = async (newsId: string) => {
    if (!user) return;

    const item = newsItems.find(item => item.id === newsId);
    if (!item) return;

    if (item.isBookmarked) {
      // Remove bookmark
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', newsId);
      toast.success('Removed from bookmarks');
    } else {
      // Add bookmark
      await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          article_id: newsId,
          article_title: item.title,
          article_summary: item.summary,
          article_source: item.source,
        });
      toast.success('Added to bookmarks');
    }

    setNewsItems(prev => prev.map(item => 
      item.id === newsId 
        ? { ...item, isBookmarked: !item.isBookmarked }
        : item
    ));
  };

  const handleShare = (newsItem: NewsItem) => {
    if (navigator.share) {
      navigator.share({
        title: newsItem.title,
        text: newsItem.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${newsItem.title}\n\n${newsItem.content}`);
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

  // Filter articles by selected stocks if any
  const filteredArticles = selectedStocks.length === 0 
    ? newsItems 
    : newsItems.filter(article => selectedStocks.includes(article.stock));

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome to Market Pulse</h1>
          <p className="text-muted-foreground">Latest financial news for your portfolio</p>
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

        {/* News Feed */}
        <div className="space-y-6">
          {filteredArticles.map((item) => (
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
                        <p className="font-medium text-sm">{item.source}</p>
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
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground mb-3">{item.content}</p>
                  
                  {/* Related Companies */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.relatedCompanies.map((company) => (
                      <span 
                        key={company} 
                        className="text-xs bg-fintech-blue/10 text-fintech-blue px-2 py-1 rounded-full"
                      >
                        ${company}
                      </span>
                    ))}
                  </div>
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
                        {item.comments.length}
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

                  {/* Comments Preview */}
                  {item.comments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="space-y-2">
                        {item.comments.slice(0, 2).map((comment) => (
                          <div key={comment.id} className="text-sm">
                            <span className="font-medium">{comment.user}</span>
                            <span className="ml-2 text-muted-foreground">{comment.content}</span>
                          </div>
                        ))}
                        {item.comments.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            View all {item.comments.length} comments
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && selectedStocks.length > 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No news articles found for your selected stocks.
            </p>
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