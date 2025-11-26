import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FeedbackWidget from '@/components/FeedbackWidget';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Share2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Bookmark {
  id: string;
  article_id: string;
  article_title: string;
  article_summary: string;
  article_source: string;
  created_at: string;
}

const Bookmarks = () => {
  const { user, loading } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

    setLoadingBookmarks(true);
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bookmarks.',
        variant: 'destructive',
      });
    } else {
      setBookmarks(data || []);
    }
    setLoadingBookmarks(false);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark.',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Removed from bookmarks' });
      fetchBookmarks();
    }
  };

  const handleShare = (bookmark: Bookmark) => {
    if (navigator.share) {
      navigator.share({
        title: bookmark.article_title,
        text: bookmark.article_summary,
      });
    } else {
      navigator.clipboard.writeText(bookmark.article_title);
      toast({ title: 'Title copied to clipboard!' });
    }
  };

  if (loading || loadingBookmarks) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4 md:pt-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Saved Articles</h1>
          <p className="text-muted-foreground">
            {bookmarks.length} {bookmarks.length === 1 ? 'article' : 'articles'} saved
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't bookmarked any articles yet.
            </p>
            <Button onClick={() => navigate('/')}>
              Browse Feed
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <Card 
                key={bookmark.id} 
                className="p-4 hover:shadow-elevated transition-shadow cursor-pointer animate-fade-in"
                onClick={() => navigate(`/article/${bookmark.article_id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{bookmark.article_source}</span>
                      <span>•</span>
                      <span>{new Date(bookmark.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold mb-2">{bookmark.article_title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {bookmark.article_summary}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(bookmark);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(bookmark.id);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <FeedbackWidget screenName="bookmarks" />
    </div>
  );
};

export default Bookmarks;
