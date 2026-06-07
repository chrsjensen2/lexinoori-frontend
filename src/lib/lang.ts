import { useSyncExternalStore } from "react";
import type { Lang } from "./i18n";

export type { Lang };

const LS_KEY = "lex:lang";

function readStorage(): Lang {
  if (typeof window === "undefined") return "da";
  try {
    const v = window.localStorage.getItem(LS_KEY);
    if (v === "en" || v === "da") return v;
  } catch {}
  return "da";
}

let _lang: Lang = readStorage();
const _listeners = new Set<() => void>();

function _notify() {
  _listeners.forEach((cb) => cb());
}

export function getLang(): Lang {
  return _lang;
}

export function setLang(code: Lang) {
  if (_lang === code) return;
  _lang = code;
  try {
    window.localStorage.setItem(LS_KEY, code);
  } catch {}
  _notify();
}

if (typeof window !== "undefined") {
  window.addEventListener("lex:language-changed", (e: Event) => {
    const code = (e as CustomEvent).detail?.code;
    if (code === "en" || code === "da") setLang(code as Lang);
  });
}

export function useLanguage(): Lang {
  return useSyncExternalStore(
    (cb) => {
      _listeners.add(cb);
      return () => _listeners.delete(cb);
    },
    () => _lang,
    () => "da" as Lang,
  );
}
