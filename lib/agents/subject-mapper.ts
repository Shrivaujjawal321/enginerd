import { z } from "zod";
import { generateStructured } from "@/lib/llm";
import type { CareerSeed, GeneratedSubject } from "./types";

const subjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number().int().min(1),
  estTopicsCount: z.number().int().min(1).max(40),
});

const outputSchema = z.object({
  subjects: z.array(subjectSchema).min(3).max(16),
});

const SYSTEM_PROMPT = `You are an engineering curriculum designer. Given a single career roadmap, produce the ordered list of subjects a student needs to master to be hireable in that role at an Indian product/services company.

Rules:
- Subject titles in English. Concrete and recognizable (e.g. "Spring Boot Basics", not "Backend Frameworks Overview").
- Descriptions in English, one sentence, what's covered.
- Order strictly from foundational to advanced.
- Estimate topic count per subject realistically (8–20 is typical).
- Cover the full pipeline: language → framework → DB → infra → testing → deploy. Don't skip ops.
- No duplicates. Each subject is its own scoped chunk of learning.`;

export async function runSubjectMapper(
  career: CareerSeed,
): Promise<{ subjects: GeneratedSubject[]; usage: import("../llm").Usage; mode: "live" | "stub"; model: string }> {
  const result = await generateStructured({
    tier: "smart",
    agentName: "subject-mapper",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Career: ${career.title}\nDescription: ${career.description}\nCategory: ${career.category}\nDifficulty: ${career.difficulty}\nDuration target: ${career.estDurationMonths} months\n\nProduce the ordered subject list.`,
    toolName: "submit_subjects",
    toolDescription: "Submit the ordered subject list for this career roadmap.",
    inputSchema: {
      type: "object",
      properties: {
        subjects: {
          type: "array",
          minItems: 3,
          maxItems: 16,
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              order: { type: "integer", minimum: 1 },
              estTopicsCount: { type: "integer", minimum: 1, maximum: 40 },
            },
            required: ["title", "description", "order", "estTopicsCount"],
          },
        },
      },
      required: ["subjects"],
    },
    validate: (raw) => outputSchema.parse(raw).subjects,
    stub: () => stubSubjects(career),
  });
  return {
    subjects: result.output,
    usage: result.usage,
    mode: result.mode,
    model: result.model,
  };
}

function stubSubjects(career: CareerSeed): GeneratedSubject[] {
  const bank: Record<string, GeneratedSubject[]> = {
    "Java Full Stack Developer": [
      { title: "Java Fundamentals", description: "Variables, control flow, OOP, exceptions, generics.", order: 1, estTopicsCount: 12 },
      { title: "Java Collections & Streams", description: "List/Map/Set, lambdas, streams, functional patterns.", order: 2, estTopicsCount: 10 },
      { title: "Spring Boot Basics", description: "Auto-config, beans, dependency injection, REST controllers.", order: 3, estTopicsCount: 12 },
      { title: "JPA & PostgreSQL", description: "Entities, relationships, transactions, query methods.", order: 4, estTopicsCount: 11 },
      { title: "REST API Design", description: "Resources, methods, status codes, idempotency, pagination.", order: 5, estTopicsCount: 9 },
      { title: "React Fundamentals", description: "Components, props, JSX, rendering model.", order: 6, estTopicsCount: 10 },
      { title: "React Hooks", description: "useState, useEffect, custom hooks, the hook mental model.", order: 7, estTopicsCount: 11 },
      { title: "Docker Essentials", description: "Images, containers, Dockerfile, networks, compose.", order: 8, estTopicsCount: 8 },
      { title: "AWS Basics", description: "Regions, IAM, EC2, S3, RDS — your first cloud day.", order: 9, estTopicsCount: 11 },
      { title: "Testing with JUnit", description: "Unit tests, mocks, integration tests, coverage that matters.", order: 10, estTopicsCount: 7 },
    ],
  };
  return (
    bank[career.title] ?? [
      { title: `${career.title} Fundamentals`, description: "Core concepts and mental models.", order: 1, estTopicsCount: 10 },
      { title: `${career.title} in Practice`, description: "Hands-on patterns and project work.", order: 2, estTopicsCount: 10 },
      { title: `${career.title} Production`, description: "Deployment, observability, and ops.", order: 3, estTopicsCount: 8 },
    ]
  );
}
