import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DUMMY_NEWS_ARTICLES } from '@/lib/dummyData';
import { ArrowLeft, Share2, Bookmark, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Article = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const article = DUMMY_NEWS_ARTICLES.find(a => a.id === id);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const generateSummary = async () => {
      if (!article) return;
      
      setLoadingSummary(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-summary', {
          body: { 
            title: article.title,
            content: article.content || article.summary 
          }
        });

        if (error) throw error;
        
        if (data?.summary) {
          setAiSummary(data.summary);
        }
      } catch (error) {
        console.error('Error generating summary:', error);
        toast({
          title: 'Could not generate AI summary',
          description: 'Showing original summary instead',
          variant: 'destructive',
        });
      } finally {
        setLoadingSummary(false);
      }
    };

    generateSummary();
  }, [article, toast]);

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Article not found</p>
          <Button onClick={() => navigate('/')}>Back to Feed</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">Article</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bookmark className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {article.imageUrl && (
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="px-2 py-1 rounded bg-accent/10 text-accent font-medium">
              {article.stock}
            </span>
            <span>{article.source}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        </div>

        <Card className="p-6 mb-6 bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-semibold">AI Summary</h2>
            {loadingSummary && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
          </div>
          <p className="text-muted-foreground">
            {loadingSummary ? 'Generating AI-powered summary...' : (aiSummary || article.summary)}
          </p>
        </Card>

        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            {article.content || "Full article content would appear here with detailed analysis, quotes, and insights about the market news."}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Article;
