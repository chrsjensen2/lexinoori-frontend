CREATE TABLE public.saved_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_id)
);

ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own saved" ON public.saved_articles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saved" ON public.saved_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own saved" ON public.saved_articles
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_saved_articles_user ON public.saved_articles(user_id);