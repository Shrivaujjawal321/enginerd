/**
 * Shared types for the agent pipeline. These mirror (a subset of) the mock
 * data types in lib/mock-data/types.ts but with extra plumbing fields the
 * pipeline needs (parent IDs, ordering, status).
 */

export type CareerSeed = {
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estDurationMonths: number;
  /** Trend-research signals (optional — populated when seeded from Trend Researcher). */
  salarySignals?: {
    fresherLpaMin: number;
    fresherLpaMax: number;
    midLevelLpaMin: number;
    midLevelLpaMax: number;
  };
  demandScore?: number;
  reasoning?: string;
};

export type GeneratedSubject = {
  title: string;
  description: string;
  order: number;
  estTopicsCount: number;
};

export type GeneratedSubtopic = {
  title: string;
  estMinutes: number;
};

export type GeneratedTopic = {
  title: string;
  subtopics: GeneratedSubtopic[];
};

export type GeneratedContentBlock =
  | { type: "what"; title: string; body: string[] }
  | { type: "why"; title: string; body: string[] }
  | { type: "how"; title: string; body: string[]; code?: { language: string; snippet: string } }
  | { type: "example"; title: string; body: string[]; code?: { language: string; snippet: string } }
  | { type: "diagram"; title: string; mermaid: string }
  | { type: "interview"; title: string; question: string; answer: string[] };

export type QualityVerdict = {
  status: "published" | "needs_review";
  notes: string[];
  hinglishRatio: number;
};
