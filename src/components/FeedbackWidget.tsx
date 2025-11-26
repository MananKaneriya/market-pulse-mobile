import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ThumbsUp, ThumbsDown, Minus, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FeedbackWidgetProps {
  screenName: string;
}

const FeedbackWidget = ({ screenName }: FeedbackWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!sentiment || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          screen_name: screenName,
          sentiment,
          comment: comment || null,
        });

      if (error) throw error;

      toast({
        title: 'Thank you!',
        description: 'Your feedback helps us improve MarketPulse.',
      });

      setIsOpen(false);
      setSentiment(null);
      setComment('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-4 z-40">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="rounded-full w-12 h-12 shadow-elevated bg-accent hover:bg-accent/90"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
      ) : (
        <div className="bg-card border border-border rounded-lg shadow-elevated p-4 w-80 animate-slide-up">
          <h3 className="font-semibold mb-3">Share your feedback</h3>
          
          <div className="flex gap-2 mb-3">
            <Button
              variant={sentiment === 'positive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSentiment('positive')}
              className="flex-1"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Good
            </Button>
            <Button
              variant={sentiment === 'neutral' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSentiment('neutral')}
              className="flex-1"
            >
              <Minus className="w-4 h-4 mr-1" />
              Okay
            </Button>
            <Button
              variant={sentiment === 'negative' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSentiment('negative')}
              className="flex-1"
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              Bad
            </Button>
          </div>

          <Textarea
            placeholder="Tell us more (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-3 min-h-[80px]"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!sentiment || submitting}
              className="flex-1"
            >
              Submit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setSentiment(null);
                setComment('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackWidget;
