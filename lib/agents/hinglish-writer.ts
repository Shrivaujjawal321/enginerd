import { z } from "zod";
import { generateStructured } from "@/lib/llm";
import type { CareerSeed, GeneratedContentBlock, GeneratedSubject } from "./types";

const codeSchema = z.object({
  language: z.string(),
  snippet: z.string(),
});

const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("what"), title: z.string(), body: z.array(z.string()).min(1) }),
  z.object({ type: z.literal("why"), title: z.string(), body: z.array(z.string()).min(1) }),
  z.object({
    type: z.literal("how"),
    title: z.string(),
    body: z.array(z.string()).min(1),
    code: codeSchema.optional(),
  }),
  z.object({
    type: z.literal("example"),
    title: z.string(),
    body: z.array(z.string()).min(1),
    code: codeSchema.optional(),
  }),
  z.object({ type: z.literal("diagram"), title: z.string(), mermaid: z.string() }),
  z.object({
    type: z.literal("interview"),
    title: z.string(),
    question: z.string(),
    answer: z.array(z.string()).min(1),
  }),
]);

const outputSchema = z.object({
  blocks: z.array(blockSchema).min(5).max(8),
});

/**
 * Hinglish style guide — mirrored in the writer's system prompt.
 * This is the ONLY layer of the platform that uses Hinglish. Marketing,
 * navigation, and all other UI surfaces stay English.
 */
const HINGLISH_STYLE_GUIDE = `Hinglish writing style guide (strict):
- 60% Hindi-Roman, 40% English. Technical terms in English (e.g. "function", "controller", "deploy").
- Friendly, slightly playful, never condescending. Voice of a senior who genuinely wants you to get it.
- Use "tu/tum", never "aap".
- Real-world analogies preferred over abstract definitions.
- Code comments may be Hinglish ("// yahan loop chalega").
- Avoid pure English paragraphs. Avoid pure Hindi paragraphs.
- Keep sentences short — 15 to 20 words ideal.
- No emoji in body copy.

Sample tone (use as a calibration):
"React Hooks basically tumhe class components ke jhanjhat se bachate hain. Pehle har state management ke liye class likhna padta tha — constructor, this.state, setState ka pura drama. useState aaya aur sab simple ho gaya. Bas function ke andar useState() call karo, done."`;

const TEACHING_PHILOSOPHY = `Teaching philosophy (CRITICAL — beginner-friendly is non-negotiable):
- Assume the reader has zero prior context. Explain every term the first time it appears.
- A beginner who has NEVER coded before should understand the "what" and "why". An experienced engineer should learn something from the "how" and the interview answer.
- Use a real-life everyday analogy in the "what" block — kitchen, traffic, bank queue, WhatsApp, food delivery. Make the abstract concrete.
- "Crystal clear" is the bar. Re-read every paragraph and ask: would a 1st year CSE student understand this? If not, simplify.
- Avoid jargon dumps. If you must use a term like "asynchronous" or "polymorphism", define it inline with a parenthetical or a follow-up sentence.
- Every code snippet must have at least one Hinglish comment explaining what's happening.
- The diagram (Mermaid) is mandatory — it's the visual the user asked for. Pick the right shape: flowchart for processes, sequenceDiagram for back-and-forth interactions, classDiagram for OOP, stateDiagram for states.`;

const SYSTEM_PROMPT = `You are a senior Indian engineer writing Hinglish learning content for engineering students. Your output is the educational body — the rest of the product chrome (navigation, buttons, headings) stays English.

You produce content blocks in this exact order:
  1. what       — What is this concept? Plain Hinglish + a real-life everyday analogy.
  2. why        — Why does it exist? What problem does it solve? Why a beginner should care.
  3. how        — How does it actually work? With a code snippet (with Hinglish comments).
  4. example    — A real-life example showing the concept in production code. With a code snippet.
  5. diagram    — A Mermaid diagram visualizing the concept (flowchart, sequenceDiagram, classDiagram, or stateDiagram).
  6. interview  — One genuinely-asked interview question and a clear Hinglish answer.

You MUST emit all 6 blocks for every subtopic. No skipping. The diagram is the user-facing "image" and is non-negotiable.

Every paragraph follows the Hinglish style guide. Code snippets stay in their natural language but inline comments may be Hinglish.

${TEACHING_PHILOSOPHY}

${HINGLISH_STYLE_GUIDE}`;

export async function runHinglishWriter(args: {
  career: CareerSeed;
  subject: GeneratedSubject;
  topicTitle: string;
  subtopicTitle: string;
}): Promise<{
  blocks: GeneratedContentBlock[];
  usage: import("../llm").Usage;
  mode: "live" | "stub";
  model: string;
}> {
  // Cost optimization: Haiku 4.5 is fast + cheap and produces excellent
  // Hinglish for the average subtopic. We only escalate to "smart" when the
  // QualityOrchestrator rejects on a first pass (Phase 3 work).
  const result = await generateStructured({
    tier: "fast",
    agentName: "hinglish-writer",
    systemPrompt: SYSTEM_PROMPT,
    cacheableUserPrefix: `Parent roadmap: ${args.career.title}\nSubject: ${args.subject.title}\nSubject description: ${args.subject.description}`,
    userPrompt: `Topic: ${args.topicTitle}\nSubtopic: ${args.subtopicTitle}\n\nWrite the full Hinglish content for this subtopic. Emit all 6 blocks in order: what, why, how (with code), example (with code), diagram (Mermaid), interview. Make sure a beginner who has never coded before can follow the "what" and "why".`,
    toolName: "submit_content",
    toolDescription: "Submit the Hinglish content blocks for this subtopic. Must include all 6 block types: what, why, how, example, diagram, interview.",
    maxTokens: 6000,
    inputSchema: {
      type: "object",
      properties: {
        blocks: {
          type: "array",
          minItems: 5,
          maxItems: 8,
          items: {
            oneOf: [
              {
                type: "object",
                properties: {
                  type: { const: "what" },
                  title: { type: "string" },
                  body: { type: "array", items: { type: "string" }, minItems: 1 },
                },
                required: ["type", "title", "body"],
              },
              {
                type: "object",
                properties: {
                  type: { const: "why" },
                  title: { type: "string" },
                  body: { type: "array", items: { type: "string" }, minItems: 1 },
                },
                required: ["type", "title", "body"],
              },
              {
                type: "object",
                properties: {
                  type: { const: "how" },
                  title: { type: "string" },
                  body: { type: "array", items: { type: "string" }, minItems: 1 },
                  code: {
                    type: "object",
                    properties: {
                      language: { type: "string" },
                      snippet: { type: "string" },
                    },
                    required: ["language", "snippet"],
                  },
                },
                required: ["type", "title", "body"],
              },
              {
                type: "object",
                properties: {
                  type: { const: "example" },
                  title: { type: "string" },
                  body: { type: "array", items: { type: "string" }, minItems: 1 },
                  code: {
                    type: "object",
                    properties: {
                      language: { type: "string" },
                      snippet: { type: "string" },
                    },
                    required: ["language", "snippet"],
                  },
                },
                required: ["type", "title", "body"],
              },
              {
                type: "object",
                properties: {
                  type: { const: "diagram" },
                  title: { type: "string" },
                  mermaid: { type: "string" },
                },
                required: ["type", "title", "mermaid"],
              },
              {
                type: "object",
                properties: {
                  type: { const: "interview" },
                  title: { type: "string" },
                  question: { type: "string" },
                  answer: { type: "array", items: { type: "string" }, minItems: 1 },
                },
                required: ["type", "title", "question", "answer"],
              },
            ],
          },
        },
      },
      required: ["blocks"],
    },
    validate: (raw) => outputSchema.parse(raw).blocks,
    stub: () => stubBlocks(args),
  });
  return {
    blocks: result.output,
    usage: result.usage,
    mode: result.mode,
    model: result.model,
  };
}

function stubBlocks(args: {
  subject: GeneratedSubject;
  topicTitle: string;
  subtopicTitle: string;
}): GeneratedContentBlock[] {
  const sub = args.subtopicTitle;
  const subj = args.subject.title;
  return [
    {
      type: "what",
      title: `What is ${sub}?`,
      body: [
        `${sub} ek concept hai jo ${subj} ke andar aata hai. Sochne ka ek aasan tareeka — ye ek tool hai jo tujhe kuch specific kaam asaan banata hai.`,
        `Real-life analogy le — jaise zomato pe order karte time tu sirf "place order" dabaata hai. Andar bahut kuch hota hai (payment, restaurant, delivery), but tujhe sirf ek button dikhata hai. ${sub} bhi ek aisi hi abstraction hai.`,
        `Bilkul beginner ke liye: ye ek "predictable, reusable piece" hai jo tu apne code me daalta hai aur baar-baar use karta hai bina sochke ki andar kya ho raha hai.`,
      ],
    },
    {
      type: "why",
      title: `Why ${sub}? — yahan tak kaise pahunche`,
      body: [
        `Pehle developers manually sab kuch handle karte the — har baar wahi 50 lines copy-paste, har file me same logic. Boring tha, aur ek choti si typo poori app down kar deti thi.`,
        `${sub} ka idea simple hai: "ek baar likho, har jagah use karo". Jab problem ek baar solve ho gayi, hum usko ek naam de dete hain aur dubara wahi dikkat face nahi karte.`,
        `Beginner ke liye sabse important: ye time bachata hai aur bugs kam karta hai. Production me jaake ye saving 100x dikhne lagti hai.`,
      ],
    },
    {
      type: "how",
      title: `How does ${sub} work?`,
      body: [
        `Mental model: tu ${sub} ko input deta hai, wo apna kaam karta hai, tujhe output deta hai. Beech ka magic abstract hai — pehle samajhne ki zaroorat nahi.`,
        `Step-by-step jab tu apne code me lagaata hai: (1) ${sub} ko import/declare kar, (2) usse expected input pass kar, (3) output handle kar. Bas — pehle ke 50 lines ki jagah 3 lines.`,
      ],
      code: {
        language: "ts",
        snippet: `// ${sub} ka basic shape\nfunction handle(input: string): string {\n  // yahan asal kaam hota hai\n  return input.trim();\n}\n\n// Use karna asaan hai\nconst result = handle("  hello  ");\nconsole.log(result); // "hello"`,
      },
    },
    {
      type: "example",
      title: `Real-life example — ${sub} production me`,
      body: [
        `Imagine kar tu ek e-commerce app bana raha hai. User checkout karta hai, payment hota hai, email bhejna hai. Ye teeno alag-alag jagah hote hain — but tu ek ${sub} bana de jo unko orchestrate kare.`,
        `Ab har jagah jahan checkout ho raha hai, tu sirf ek line likhega. Code DRY (Don't Repeat Yourself) ho gaya, testing simple ho gayi, naye teammate ko samjhana asaan ho gaya.`,
      ],
      code: {
        language: "ts",
        snippet: `// Real-life: checkout flow\nasync function completeOrder(orderId: string) {\n  // ${sub} sab handle karta hai\n  await processPayment(orderId);\n  await sendOrderEmail(orderId);\n  await notifyWarehouse(orderId);\n  return { ok: true };\n}\n\n// Use karna ek line ka kaam\nawait completeOrder("ord_42");`,
      },
    },
    {
      type: "diagram",
      title: `${sub} ka flow`,
      mermaid: `flowchart LR\n  A[User input] --> B[${sub}]\n  B --> C{Validate}\n  C -- valid --> D[Process]\n  C -- invalid --> E[Return error]\n  D --> F[Return result]`,
    },
    {
      type: "interview",
      title: "Common interview question",
      question: `Explain ${sub} like I'm a beginner — when would you use it and what's the tradeoff?`,
      answer: [
        `Short answer: ${sub} use kar jab tu chaahe same logic ek se zyada jagah pe — copy-paste karne ke bajaye usse ek single jagah pe rakh.`,
        `Long answer: production me ek concrete example le — agar tu ${subj.toLowerCase()} ke code me 5 jagah same validation likh raha hai, ye ek smell hai. ${sub} usse ek place pe consolidate kar de. Bug fix ek hi jagah hota hai, test cases ek hi jagah likhne padte hain.`,
        `Tradeoff: zyada abstraction se naya developer confuse ho sakta hai — code thoda indirect lagta hai. Rule: 3 jagah same code dikha, tab abstract kar. Pehle nahi.`,
      ],
    },
  ];
}
