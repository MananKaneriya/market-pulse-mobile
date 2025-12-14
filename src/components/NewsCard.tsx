import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Heart, MessageCircle, Share2, Bookmark, BookmarkCheck, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
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

  const handleLike = () => {
    setIsLikeAnimating(true);
    setLiked(!liked);
    setTimeout(() => setIsLikeAnimating(false), 300);
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
      className="group overflow-hidden cursor-pointer animate-fade-in hover-lift border-0 shadow-card"
      onClick={() => navigate(`/article/${article.id}`)}
    >
      {/* Image with overlay gradient */}
      {article.imageUrl && (
        <div className="relative overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        </div>
      )}
      
      <div className="p-5">
        {/* Stock tag and meta */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-hero text-primary-foreground font-semibold">
            <TrendingUp className="w-3 h-3" />
            {article.stock}
          </span>
          <span className="font-medium">{article.source}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{timeAgo()}</span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-lg mb-2.5 line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {article.title}
        </h3>
        
        {/* Summary */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
          {article.summary}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className={cn(
              "gap-1.5 transition-all duration-200",
              liked ? "text-fintech-red" : "hover:text-fintech-red"
            )}
          >
            <Heart 
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                liked && "fill-current",
                isLikeAnimating && "scale-125"
              )} 
            />
            <span className="text-xs font-medium">Like</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => e.stopPropagation()}
            className="gap-1.5 hover:text-fintech-blue"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Comment</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="gap-1.5 hover:text-fintech-purple"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-medium">Share</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleBookmark();
            }}
            className={cn(
              "transition-all duration-200",
              bookmarked ? "text-fintech-gold" : "hover:text-fintech-gold"
            )}
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
