import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

type State = {
  userId: string | null;
  loaded: boolean;
  ids: Set<string>;
  promptOpen: boolean;
};

let state: State = { userId: null, loaded: false, ids: new Set(), promptOpen: false };
const listeners = new Set<() => void>();

function setState(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

async function loadForUser(userId: string | null) {
  if (!userId) {
    setState({ userId: null, loaded: true, ids: new Set() });
    return;
  }
  const { data } = await supabase
    .from("saved_articles")
    .select("article_id")
    .eq("user_id", userId);
  setState({
    userId,
    loaded: true,
    ids: new Set((data ?? []).map((r: { article_id: string }) => r.article_id)),
  });
}

let initialized = false;
function ensureInit() {
  if (initialized) return;
  initialized = true;
  supabase.auth.getSession().then(({ data }) => {
    loadForUser(data.session?.user?.id ?? null);
  });
  supabase.auth.onAuthStateChange((_e, session) => {
    loadForUser(session?.user?.id ?? null);
  });
}

export function useSavedArticles() {
  useEffect(ensureInit, []);
  const snap = useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );

  const isSaved = (id: string) => snap.ids.has(id);

  const toggle = async (id: string) => {
    if (!snap.userId) {
      setState({ promptOpen: true });
      return;
    }
    const next = new Set(snap.ids);
    if (snap.ids.has(id)) {
      next.delete(id);
      setState({ ids: next });
      await supabase
        .from("saved_articles")
        .delete()
        .eq("user_id", snap.userId)
        .eq("article_id", id);
    } else {
      next.add(id);
      setState({ ids: next });
      await supabase
        .from("saved_articles")
        .insert({ user_id: snap.userId, article_id: id });
    }
  };

  const closePrompt = () => setState({ promptOpen: false });

  return {
    userId: snap.userId,
    loaded: snap.loaded,
    savedIds: snap.ids,
    promptOpen: snap.promptOpen,
    isSaved,
    toggle,
    closePrompt,
  };
}
