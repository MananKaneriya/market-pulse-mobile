-- Create article_views table to track reading history
CREATE TABLE public.article_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id TEXT NOT NULL,
  article_title TEXT,
  article_stock TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_spent_seconds INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own article views"
ON public.article_views
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own article views"
ON public.article_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_article_views_user_id ON public.article_views(user_id);
CREATE INDEX idx_article_views_article_id ON public.article_views(article_id, user_id);