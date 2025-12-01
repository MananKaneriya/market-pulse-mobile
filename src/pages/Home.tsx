import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import NewsCard from '@/components/NewsCard';
import FeedbackWidget from '@/components/FeedbackWidget';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DUMMY_NEWS_ARTICLES, DAILY_TIPS } from '@/lib/dummyData';
import { X, Lightbulb } from 'lucide-react';

const Home = () => {
  const { user, loading } = useAuth();
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [showTip, setShowTip] = useState(true);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);
  const [personalizedArticles, setPersonalizedArticles] = useState<typeof DUMMY_NEWS_ARTICLES>([]);
  const [loadingPersonalization, setLoadingPersonalization] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserStocks();
      fetchBookmarks();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedStocks.length > 0) {
      personalizeArticles();
    }
  }, [user, selectedStocks]);

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
      setBookmarkedArticles(data.map(d => d.article_id));
    }
  };

  const personalizeArticles = async () => {
    if (!user) return;

    setLoadingPersonalization(true);
    try {
      // Fetch reading history
      const { data: readingHistory } = await supabase
        .from('article_views')
        .select('article_id, article_title, article_stock, viewed_at')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(10);

      // Filter articles by selected stocks
      const filteredArticles = DUMMY_NEWS_ARTICLES.filter(article =>
        selectedStocks.includes(article.stock)
      );

      if (filteredArticles.length === 0) {
        setPersonalizedArticles([]);
        return;
      }

      // Call AI personalization
      const { data, error } = await supabase.functions.invoke('personalize-feed', {
        body: {
          articles: filteredArticles,
          selectedStocks,
          readingHistory: readingHistory || []
        }
      });

      if (error) throw error;

      if (data?.rankedIndices) {
        // Reorder articles based on AI ranking
        const ranked = data.rankedIndices
          .map((index: number) => filteredArticles[index])
          .filter(Boolean);
        setPersonalizedArticles(ranked);
      } else {
        setPersonalizedArticles(filteredArticles);
      }
    } catch (error) {
      console.error('Error personalizing feed:', error);
      // Fallback to basic filtering
      const filteredArticles = DUMMY_NEWS_ARTICLES.filter(article =>
        selectedStocks.includes(article.stock)
      );
      setPersonalizedArticles(filteredArticles);
    } finally {
      setLoadingPersonalization(false);
    }
  };

  const trackArticleView = async (articleId: string, articleTitle: string, articleStock: string) => {
    if (!user) return;

    try {
      await supabase.from('article_views').insert({
        user_id: user.id,
        article_id: articleId,
        article_title: articleTitle,
        article_stock: articleStock
      });
    } catch (error) {
      console.error('Error tracking article view:', error);
    }
  };

  const filteredArticles = selectedStocks.length === 0 
    ? DUMMY_NEWS_ARTICLES 
    : (personalizedArticles.length > 0 ? personalizedArticles : DUMMY_NEWS_ARTICLES.filter(article =>
        selectedStocks.includes(article.stock)
      ));

  const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];

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
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Market Feed</h1>
          <p className="text-muted-foreground">Latest news for your portfolio</p>
        </div>

        {showTip && (
          <Card className="mb-6 p-4 bg-gradient-accent text-accent-foreground animate-slide-up">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">💡 Daily Tip</h3>
                <p className="text-sm">{randomTip}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTip(false)}
                className="text-accent-foreground hover:bg-accent-foreground/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

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

        {loadingPersonalization && selectedStocks.length > 0 && (
          <Card className="mb-4 p-4 bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
              <span>Personalizing your feed...</span>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {filteredArticles.map(article => (
            <div key={article.id} onClick={() => trackArticleView(article.id, article.title, article.stock)}>
              <NewsCard
                article={article}
                isBookmarked={bookmarkedArticles.includes(article.id)}
                onBookmarkChange={fetchBookmarks}
              />
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && selectedStocks.length > 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No news articles found for your selected stocks.
            </p>
          </Card>
        )}
      </main>

      <FeedbackWidget screenName="home_feed" />
    </div>
  );
};

export default Home;
