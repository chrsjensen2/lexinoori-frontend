CREATE TABLE public.source_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  headline text NOT NULL,
  body text,
  url text NOT NULL,
  source_name text,
  scraped_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.source_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Source articles are public" ON public.source_articles FOR SELECT USING (true);
CREATE INDEX idx_source_articles_scraped_at ON public.source_articles (scraped_at DESC);