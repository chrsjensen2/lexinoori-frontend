import type { Topic } from "@/components/feed/TopicPill";

export type CatalogArticle = {
  id: string;
  topic: Topic;
  headline: string;
  sources: number;
  bias: string;
  biasColor: string;
};

// Mirrors the demo articles shown in the Today feed so saved bookmarks can be
// rendered on the Saved screen without a separate articles fetch.
const ENTRIES: CatalogArticle[] = [
  { id: "1", topic: "politics", headline: "EU finance ministers split over emergency defence spending package ahead of summit.", sources: 9, bias: "Centre-left", biasColor: "#00C864" },
  { id: "2", topic: "climate", headline: "Atlantic hurricane season opens with two named storms in single week, NOAA warns.", sources: 14, bias: "Centre", biasColor: "#00C864" },
  { id: "3", topic: "economics", headline: "Yen tumbles to 38-year low as Bank of Japan signals reluctance to intervene.", sources: 22, bias: "Centre-right", biasColor: "#FFD000" },
  { id: "4", topic: "technology", headline: "Meta releases open-weights vision model, undercutting closed competitors on benchmarks.", sources: 11, bias: "Centre", biasColor: "#00C864" },
  { id: "p1", topic: "politics", headline: "EU finance ministers split over emergency defence spending package ahead of summit.", sources: 9, bias: "Centre-left", biasColor: "#00C864" },
  { id: "p2", topic: "politics", headline: "French parliament votes to extend state of emergency by 90 days.", sources: 12, bias: "Centre", biasColor: "#00C864" },
  { id: "p3", topic: "politics", headline: "NATO secretary general calls emergency summit following Baltic incident.", sources: 18, bias: "Centre", biasColor: "#00C864" },
  { id: "c1", topic: "climate", headline: "Atlantic hurricane season opens with two named storms in single week, NOAA warns.", sources: 14, bias: "Centre", biasColor: "#00C864" },
  { id: "c2", topic: "climate", headline: "Arctic permafrost thaw accelerating faster than models predicted, study finds.", sources: 8, bias: "Centre-left", biasColor: "#00C864" },
  { id: "c3", topic: "climate", headline: "EU carbon border tax faces legal challenge from six member states.", sources: 11, bias: "Centre", biasColor: "#FFD000" },
  { id: "t1", topic: "technology", headline: "Meta releases open-weights vision model, undercutting closed competitors on benchmarks.", sources: 11, bias: "Centre", biasColor: "#00C864" },
  { id: "t2", topic: "technology", headline: "Apple delays AI feature rollout in Europe citing regulatory uncertainty.", sources: 16, bias: "Centre", biasColor: "#00C864" },
  { id: "t3", topic: "technology", headline: "OpenAI announces GPT-5 with extended context window and reasoning improvements.", sources: 22, bias: "Centre", biasColor: "#00C864" },
  { id: "e1", topic: "economics", headline: "Yen tumbles to 38-year low as Bank of Japan signals reluctance to intervene.", sources: 22, bias: "Centre-right", biasColor: "#FFD000" },
  { id: "e2", topic: "economics", headline: "German industrial output contracts for third consecutive quarter.", sources: 9, bias: "Centre", biasColor: "#00C864" },
  { id: "e3", topic: "economics", headline: "IMF revises global growth forecast downward citing trade fragmentation.", sources: 19, bias: "Centre", biasColor: "#00C864" },
  { id: "breaking", topic: "breaking", headline: "Breaking news article.", sources: 12, bias: "Centre", biasColor: "#00C864" },
];

const MAP = new Map(ENTRIES.map((a) => [a.id, a]));

export function getArticle(id: string): CatalogArticle {
  return (
    MAP.get(id) ?? {
      id,
      topic: "politics",
      headline: "Saved article",
      sources: 0,
      bias: "Centre",
      biasColor: "#8E8E93",
    }
  );
}
