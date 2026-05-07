import { z } from "zod";
import { generateStructured } from "@/lib/llm";
import type {
  CareerSeed,
  GeneratedSubject,
  GeneratedTopic,
  GeneratedSubtopic,
} from "./types";

const subtopicSchema = z.object({
  title: z.string(),
  estMinutes: z.number().int().min(5).max(60),
});

const topicSchema = z.object({
  title: z.string(),
  subtopics: z.array(subtopicSchema).min(2).max(6),
});

const outputSchema = z.object({
  topics: z.array(topicSchema).min(3).max(12),
});

const SYSTEM_PROMPT = `You are an expert engineering curriculum designer. Given a subject inside a parent career roadmap, produce its ordered topic + subtopic structure (two levels).

Rules:
- Topic and subtopic titles in English.
- Group related subtopics under a single topic; subtopics are concrete, focused units (15–30 min reads).
- Cover the subject end-to-end without padding. No "Conclusion" topics; just real material.
- 3–12 topics, 2–6 subtopics per topic.`;

export async function runTopicDeepdiver(args: {
  career: CareerSeed;
  subject: GeneratedSubject;
}): Promise<{ topics: GeneratedTopic[]; usage: import("../llm").Usage; mode: "live" | "stub"; model: string }> {
  const result = await generateStructured({
    tier: "smart",
    agentName: "topic-deepdiver",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Parent career: ${args.career.title}\nSubject: ${args.subject.title}\nSubject description: ${args.subject.description}\nTarget topic count: ${args.subject.estTopicsCount}\n\nProduce the ordered topic + subtopic tree.`,
    toolName: "submit_topics",
    toolDescription: "Submit the topic and subtopic tree for this subject.",
    inputSchema: {
      type: "object",
      properties: {
        topics: {
          type: "array",
          minItems: 3,
          maxItems: 12,
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              subtopics: {
                type: "array",
                minItems: 2,
                maxItems: 6,
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    estMinutes: { type: "integer", minimum: 5, maximum: 60 },
                  },
                  required: ["title", "estMinutes"],
                },
              },
            },
            required: ["title", "subtopics"],
          },
        },
      },
      required: ["topics"],
    },
    validate: (raw) => outputSchema.parse(raw).topics,
    stub: () => stubTopics(args.subject),
  });
  return {
    topics: result.output,
    usage: result.usage,
    mode: result.mode,
    model: result.model,
  };
}

function stubTopics(subject: GeneratedSubject): GeneratedTopic[] {
  const sub = (titles: string[]): GeneratedSubtopic[] =>
    titles.map((t) => ({ title: t, estMinutes: 18 }));

  if (/Spring Boot/i.test(subject.title)) {
    return [
      {
        title: "Spring Boot fundamentals",
        subtopics: sub(["Auto-configuration", "Starters & dependencies", "Application properties"]),
      },
      {
        title: "Building REST APIs",
        subtopics: sub(["REST controllers", "Request mapping", "Exception handling"]),
      },
      {
        title: "Persistence with JPA",
        subtopics: sub(["Entities & repositories", "Transactions", "Query methods"]),
      },
      {
        title: "Production basics",
        subtopics: sub(["Profiles & config", "Actuator endpoints", "Observability"]),
      },
    ];
  }
  if (/React Hooks/i.test(subject.title)) {
    return [
      { title: "Core hooks", subtopics: sub(["useState basics", "useEffect basics", "useRef basics"]) },
      { title: "Performance hooks", subtopics: sub(["useMemo deep dive", "useCallback deep dive"]) },
      { title: "Custom hooks", subtopics: sub(["Designing your own", "Testing custom hooks"]) },
    ];
  }
  return [
    { title: `${subject.title} essentials`, subtopics: sub(["Overview", "Core concepts", "First example"]) },
    { title: `${subject.title} patterns`, subtopics: sub(["Common patterns", "Anti-patterns"]) },
    { title: `${subject.title} in production`, subtopics: sub(["Deployment", "Debugging"]) },
  ];
}
