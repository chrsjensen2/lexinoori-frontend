
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journalists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Public can read sources" ON public.sources FOR SELECT USING (true);
CREATE POLICY "Public can read journalists" ON public.journalists FOR SELECT USING (true);
CREATE POLICY "Public can read story clusters" ON public.story_clusters FOR SELECT USING (true);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
