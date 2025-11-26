import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DUMMY_NEWS_ARTICLES } from '@/lib/dummyData';
import { ArrowLeft, Share2, Bookmark } from 'lucide-react';

const Article = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = DUMMY_NEWS_ARTICLES.find(a => a.id === id);

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
          <h2 className="font-semibold mb-2">AI Summary</h2>
          <p className="text-muted-foreground">{article.summary}</p>
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
