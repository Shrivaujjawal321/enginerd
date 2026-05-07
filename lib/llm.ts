/**
 * Thin Anthropic SDK wrapper for the 5-agent content pipeline.
 *
 * Two modes:
 *   - LIVE  — when ANTHROPIC_API_KEY is set, calls Claude with structured
 *             output via tool-use, prompt caching on the system prompt, and
 *             per-call usage logging.
 *   - STUB  — when the key is unset, returns a deterministic offline fixture
 *             so the entire pipeline still runs end-to-end (CI, demos, dev).
 *
 * Models per tier:
 *   - smart → ENGINERD_MODEL_SMART (default: claude-sonnet-4-6)
 *   - fast  → ENGINERD_MODEL_FAST  (default: claude-haiku-4-5)
 */

import Anthropic from "@anthropic-ai/sdk";

export type AgentTier = "smart" | "fast";

const MODEL_SMART = process.env.ENGINERD_MODEL_SMART || "claude-sonnet-4-6";
const MODEL_FAST = process.env.ENGINERD_MODEL_FAST || "claude-haiku-4-5";

// USD per 1M tokens. cache_creation = base * 1.25; cache_read = base * 0.1.
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

let cached: Anthropic | null = null;
function client(): Anthropic {
  if (!cached) cached = new Anthropic();
  return cached;
}

export function isLive(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function modelFor(tier: AgentTier): string {
  return tier === "smart" ? MODEL_SMART : MODEL_FAST;
}

export type Usage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  costUsd: number;
};

export type GenerateInput<T> = {
  tier: AgentTier;
  agentName: string;
  systemPrompt: string;
  userPrompt: string;
  /**
   * Optional user-prompt prefix that's stable across calls (e.g. style guide,
   * roadmap context). When provided, gets its own ephemeral cache breakpoint
   * so repeated calls within ~5 minutes hit the cache.
   */
  cacheableUserPrefix?: string;
  toolName: string;
  toolDescription: string;
  /** JSON Schema (object) for the tool's input — what the model must produce. */
  inputSchema: Record<string, unknown>;
  /** Validate + narrow the tool's raw input. Throws on failure. */
  validate: (raw: unknown) => T;
  /** Deterministic offline fixture used in stub mode. */
  stub: () => T;
  maxTokens?: number;
};

export type GenerateResult<T> = {
  output: T;
  usage: Usage;
  mode: "live" | "stub";
  model: string;
};

export async function generateStructured<T>(
  input: GenerateInput<T>,
): Promise<GenerateResult<T>> {
  const model = modelFor(input.tier);

  if (!isLive()) {
    return {
      output: input.stub(),
      usage: zeroUsage(),
      mode: "stub",
      model,
    };
  }

  const userContent: Anthropic.TextBlockParam[] = input.cacheableUserPrefix
    ? [
        {
          type: "text",
          text: input.cacheableUserPrefix,
          cache_control: { type: "ephemeral" },
        },
        { type: "text", text: input.userPrompt },
      ]
    : [{ type: "text", text: input.userPrompt }];

  const response = await client().messages.create({
    model,
    max_tokens: input.maxTokens ?? 4096,
    system: [
      {
        type: "text",
        text: input.systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [
      {
        name: input.toolName,
        description: input.toolDescription,
        input_schema: input.inputSchema as Anthropic.Tool["input_schema"],
      },
    ],
    tool_choice: { type: "tool", name: input.toolName },
    messages: [{ role: "user", content: userContent }],
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!toolUse) {
    throw new Error(
      `[${input.agentName}] Expected tool_use block; got stop_reason=${response.stop_reason}`,
    );
  }

  const output = input.validate(toolUse.input);

  return {
    output,
    usage: computeUsage(response.usage, model),
    mode: "live",
    model,
  };
}

function zeroUsage(): Usage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    costUsd: 0,
  };
}

function computeUsage(
  raw: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number | null;
    cache_read_input_tokens?: number | null;
  },
  model: string,
): Usage {
  const pricing = PRICING[model] ?? { input: 3, output: 15 };
  const inputTokens = raw.input_tokens ?? 0;
  const outputTokens = raw.output_tokens ?? 0;
  const cacheCreationTokens = raw.cache_creation_input_tokens ?? 0;
  const cacheReadTokens = raw.cache_read_input_tokens ?? 0;

  const costUsd =
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output +
    (cacheCreationTokens / 1_000_000) * pricing.input * 1.25 +
    (cacheReadTokens / 1_000_000) * pricing.input * 0.1;

  return {
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheCreationTokens,
    costUsd: Math.round(costUsd * 1_000_000) / 1_000_000,
  };
}
