ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS update_summary TEXT,
ADD COLUMN IF NOT EXISTS update_summary_da TEXT,
ADD COLUMN IF NOT EXISTS update_summary_de TEXT,
ADD COLUMN IF NOT EXISTS update_summary_es TEXT;