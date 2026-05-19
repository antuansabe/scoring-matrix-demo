import Anthropic from "@anthropic-ai/sdk";

export class AnthropicConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnthropicConfigError";
  }
}

export type ClaudeCallOptions = {
  model: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
  temperature?: number;
};

export type ClaudeCallResult = {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheCreationTokens: number;
  };
};

let _client: Anthropic | null = null;

// Deferred until first use so the module can be imported in contexts where
// ANTHROPIC_API_KEY is not present (CI typecheck, test runners, etc.).
function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new AnthropicConfigError("ANTHROPIC_API_KEY is not set");
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

function stripCodeFences(raw: string): string {
  const s = raw.trim();
  const match = s.match(/^```[a-zA-Z]*\s*\n?([\s\S]*?)\n?```$/);
  return match ? match[1].trim() : s;
}

export async function callClaudeWithCachedSystem(
  opts: ClaudeCallOptions,
): Promise<ClaudeCallResult> {
  const { model, systemPrompt, userMessage, maxTokens, temperature = 0 } = opts;

  const response = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const first = response.content[0];
  if (!first || first.type !== "text") {
    throw new Error("The model response contains no text.");
  }

  return {
    text: stripCodeFences(first.text),
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
      cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0,
    },
  };
}
