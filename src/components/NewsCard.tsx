import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Heart, MessageCircle, Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface NewsCardProps {
  article: {
    id: string;
    title: string;
    source: string;
    summary: string;
    stock: string;
    timestamp: string;
    imageUrl?: string;
  };
  isBookmarked?: boolean;
  onBookmarkChange?: () => void;
}

const NewsCard = ({ article, isBookmarked = false, onBookmarkChange }: NewsCardProps) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBookmark = async () => {
    if (!user) return;

    try {
      if (bookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', article.id);
      } else {
        await supabase.from('bookmarks').insert({
          user_id: user.id,
          article_id: article.id,
          article_title: article.title,
          article_summary: article.summary,
          article_source: article.source,
        });
      }

      setBookmarked(!bookmarked);
      onBookmarkChange?.();
      
      toast({
        title: bookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update bookmark.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const timeAgo = () => {
    const now = new Date();
    const articleTime = new Date(article.timestamp);
    const diffInHours = Math.floor((now.getTime() - articleTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <Card 
      className="overflow-hidden shadow-card hover:shadow-elevated transition-shadow cursor-pointer animate-fade-in"
      onClick={() => navigate(`/article/${article.id}`)}
    >
      {article.imageUrl && (
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="px-2 py-1 rounded bg-accent/10 text-accent font-medium">
            {article.stock}
          </span>
          <span>{article.source}</span>
          <span>•</span>
          <span>{timeAgo()}</span>
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {article.summary}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            className={liked ? 'text-red-500' : ''}
          >
            <Heart className={`w-4 h-4 mr-1 ${liked ? 'fill-current' : ''}`} />
            <span className="text-xs">Like</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
            <MessageCircle className="w-4 h-4 mr-1" />
            <span className="text-xs">Comment</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
          >
            <Share2 className="w-4 h-4 mr-1" />
            <span className="text-xs">Share</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleBookmark();
            }}
            className={bookmarked ? 'text-accent' : ''}
          >
            {bookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-current" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NewsCard;
