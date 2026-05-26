
ALTER TABLE public.source_articles
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS journalist_id uuid REFERENCES public.journalists(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_source_articles_journalist_id
  ON public.source_articles(journalist_id);
