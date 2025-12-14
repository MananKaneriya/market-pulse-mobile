import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FeedbackWidget from '@/components/FeedbackWidget';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Share2, Trash2, Bookmark, BookmarkX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="min-h-screen bg-background bg-mesh pb-20 md:pb-4 md:pt-20">
        <Navbar />
        <main className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-mesh pb-20 md:pb-4 md:pt-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold font-display">Saved Articles</h1>
          </div>
          <p className="text-muted-foreground ml-13">
            {bookmarks.length} {bookmarks.length === 1 ? 'article' : 'articles'} saved
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <Card className="p-12 text-center glass border-0">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <BookmarkX className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No saved articles yet</h3>
            <p className="text-muted-foreground mb-6">
              Bookmark articles from your feed to read later
            </p>
            <Button onClick={() => navigate('/')} variant="gradient">
              Browse Feed
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <Card 
                key={bookmark.id} 
                className="p-5 hover-lift cursor-pointer animate-fade-in border-0 shadow-card"
                onClick={() => navigate(`/article/${bookmark.article_id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="font-medium">{bookmark.article_source}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{new Date(bookmark.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold font-display mb-2 line-clamp-2">{bookmark.article_title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {bookmark.article_summary}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(bookmark);
                      }}
                      className="hover:text-fintech-purple"
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
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
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