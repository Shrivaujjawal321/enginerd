import { z } from "zod";
import { generateStructured } from "@/lib/llm";

/**
 * Trend Researcher — Stage 1 of the new pipeline.
 *
 * Takes an industry hint and returns a ranked list of CURRENTLY high-paying
 * engineering career roadmaps for the Indian market. The pipeline picks the
 * top 1 (highest salary, highest demand) and processes it deeply.
 *
 * Live mode: Claude reasons over its training knowledge of the Indian
 * engineering job market.
 *
 * Note: actual real-time web search can be added by enabling the
 * web_search_20260209 server-side tool — kept off by default to control
 * cost and keep the demo deterministic.
 */

const trendingRoadmapSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  category: z.enum([
    "Web Development",
    "Mobile",
    "Data & ML",
    "DevOps & Cloud",
    "Systems",
    "Game Dev",
    "Security",
    "Blockchain",
  ]),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  estDurationMonths: z.number().int().min(1).max(18),
  salarySignals: z.object({
    fresherLpaMin: z.number().min(0).max(200),
    fresherLpaMax: z.number().min(0).max(200),
    midLevelLpaMin: z.number().min(0).max(400),
    midLevelLpaMax: z.number().min(0).max(400),
  }),
  demandScore: z.number().int().min(1).max(10),
  reasoning: z.string().min(20),
});

export type TrendingRoadmap = z.infer<typeof trendingRoadmapSchema>;

const outputSchema = z.object({
  roadmaps: z.array(trendingRoadmapSchema).min(1).max(8),
});

const SYSTEM_PROMPT = `You are a career-trend researcher for Indian engineering students. Your job: given an industry hint, return a ranked list of engineering career paths that are CURRENTLY high-paying in India and rising in demand.

Focus on roles where:
- Fresher CTC is at least 8 LPA at top product companies
- Demand is rising (not flat, not declining) over the past 12 months
- The skills are concrete and learnable in 4-8 months

Be honest about the salary range — quote realistic numbers based on what mid-tier and top product companies actually pay in Bengaluru/Hyderabad/NCR. Don't inflate, don't lowball.

Rank STRICTLY by demand × salary. The first roadmap should be the single best opportunity right now.

Rules:
- Roadmap titles in clear English (e.g. "Generative AI Engineer", "Senior Frontend Engineer with Performance Specialization").
- Descriptions are one sentence, plain English, what the role actually does.
- Category from the allowed enum. Don't invent new ones.
- Difficulty: most production roles are "Intermediate"; reserve "Advanced" for genuinely hard paths (deep ML, distributed systems, security research).
- Salary signals: fresherLpaMin/Max for 0-2 yrs experience; midLevelLpaMin/Max for 2-5 yrs experience.
- demandScore: 1 (declining) to 10 (red-hot, salaries rising).
- Reasoning: 1-2 sentences on WHY this is high-paying right now (specific company moves, industry shifts).
- No duplicates. No generic catch-alls like "Software Engineer".`;

export async function runTrendResearcher(input: {
  industry: string;
  count: number;
}): Promise<{
  roadmaps: TrendingRoadmap[];
  usage: import("../llm").Usage;
  mode: "live" | "stub";
  model: string;
}> {
  const result = await generateStructured({
    tier: "smart",
    agentName: "trend-researcher",
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Industry hint: ${input.industry}\nReturn the top ${input.count} highest-paying, highest-demand engineering roadmaps for the Indian market RIGHT NOW. Rank strictly best-first.`,
    toolName: "submit_trending_roadmaps",
    toolDescription:
      "Submit the ranked list of currently high-paying engineering roadmaps.",
    inputSchema: {
      type: "object",
      properties: {
        roadmaps: {
          type: "array",
          minItems: 1,
          maxItems: 8,
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              category: {
                type: "string",
                enum: [
                  "Web Development",
                  "Mobile",
                  "Data & ML",
                  "DevOps & Cloud",
                  "Systems",
                  "Game Dev",
                  "Security",
                  "Blockchain",
                ],
              },
              difficulty: {
                type: "string",
                enum: ["Beginner", "Intermediate", "Advanced"],
              },
              estDurationMonths: {
                type: "integer",
                minimum: 1,
                maximum: 18,
              },
              salarySignals: {
                type: "object",
                properties: {
                  fresherLpaMin: { type: "number", minimum: 0, maximum: 200 },
                  fresherLpaMax: { type: "number", minimum: 0, maximum: 200 },
                  midLevelLpaMin: { type: "number", minimum: 0, maximum: 400 },
                  midLevelLpaMax: { type: "number", minimum: 0, maximum: 400 },
                },
                required: [
                  "fresherLpaMin",
                  "fresherLpaMax",
                  "midLevelLpaMin",
                  "midLevelLpaMax",
                ],
              },
              demandScore: { type: "integer", minimum: 1, maximum: 10 },
              reasoning: { type: "string" },
            },
            required: [
              "title",
              "description",
              "category",
              "difficulty",
              "estDurationMonths",
              "salarySignals",
              "demandScore",
              "reasoning",
            ],
          },
        },
      },
      required: ["roadmaps"],
    },
    validate: (raw) => outputSchema.parse(raw).roadmaps,
    stub: () => stubRoadmaps(input),
  });
  return {
    roadmaps: result.output,
    usage: result.usage,
    mode: result.mode,
    model: result.model,
  };
}

function stubRoadmaps(input: { count: number }): TrendingRoadmap[] {
  const bank: TrendingRoadmap[] = [
    {
      title: "Generative AI Engineer",
      description:
        "Build production LLM applications with prompt engineering, RAG, and fine-tuning.",
      category: "Data & ML",
      difficulty: "Advanced",
      estDurationMonths: 7,
      salarySignals: {
        fresherLpaMin: 18,
        fresherLpaMax: 32,
        midLevelLpaMin: 38,
        midLevelLpaMax: 80,
      },
      demandScore: 10,
      reasoning:
        "Every product company is shipping AI features. Razorpay, Zerodha, Postman, Swiggy all hiring aggressively. Skill scarcity drives premium CTC.",
    },
    {
      title: "Java Full Stack Developer",
      description:
        "Spring Boot APIs, React frontends, and AWS deployment for product companies.",
      category: "Web Development",
      difficulty: "Intermediate",
      estDurationMonths: 6,
      salarySignals: {
        fresherLpaMin: 14,
        fresherLpaMax: 26,
        midLevelLpaMin: 28,
        midLevelLpaMax: 50,
      },
      demandScore: 9,
      reasoning:
        "Most consistent demand across MNCs and Indian product companies. Amazon, Flipkart, Atlassian hire continuously at this profile.",
    },
    {
      title: "Senior Frontend Engineer (React + Performance)",
      description:
        "React, TypeScript, accessibility, and Core Web Vitals — frontend craft for product teams.",
      category: "Web Development",
      difficulty: "Intermediate",
      estDurationMonths: 5,
      salarySignals: {
        fresherLpaMin: 12,
        fresherLpaMax: 24,
        midLevelLpaMin: 28,
        midLevelLpaMax: 60,
      },
      demandScore: 9,
      reasoning:
        "Frontend specialists with perf + a11y are scarce. Razorpay, Postman, Swiggy pay 30%+ premium for this profile.",
    },
    {
      title: "Cloud / DevOps Engineer (AWS + Kubernetes)",
      description:
        "Linux, Docker, Kubernetes, Terraform, observability — keep production alive.",
      category: "DevOps & Cloud",
      difficulty: "Advanced",
      estDurationMonths: 7,
      salarySignals: {
        fresherLpaMin: 13,
        fresherLpaMax: 25,
        midLevelLpaMin: 30,
        midLevelLpaMax: 65,
      },
      demandScore: 9,
      reasoning:
        "Cloud-native is now table stakes. AWS-certified engineers with K8s experience get bidding wars at startups and MNCs.",
    },
    {
      title: "Data Engineer (Python + Spark)",
      description:
        "SQL, Python, Airflow, Kafka, dbt, and warehouses — the analytics data plane.",
      category: "Data & ML",
      difficulty: "Intermediate",
      estDurationMonths: 6,
      salarySignals: {
        fresherLpaMin: 12,
        fresherLpaMax: 24,
        midLevelLpaMin: 28,
        midLevelLpaMax: 55,
      },
      demandScore: 8,
      reasoning:
        "Every product company needs pipelines. Higher floor than pure ML, lower competition than GenAI.",
    },
    {
      title: "Security Engineer (AppSec + Cloud)",
      description:
        "OWASP, threat modeling, cloud security, and pen testing — the moat that's still under-served.",
      category: "Security",
      difficulty: "Advanced",
      estDurationMonths: 7,
      salarySignals: {
        fresherLpaMin: 14,
        fresherLpaMax: 26,
        midLevelLpaMin: 32,
        midLevelLpaMax: 70,
      },
      demandScore: 8,
      reasoning:
        "Compliance pressure (DPDP, RBI, SEBI) and AppSec scarcity push CTC above general SDE roles.",
    },
  ];
  return bank.slice(0, Math.max(1, Math.min(input.count, bank.length)));
}
