import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  thinkingEnabled: boolean;
  reasoningEffort: "high" | "max";
  temperature?: number;
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    strict?: boolean;
  };
}

export class DeepSeekClient {
  private client: OpenAI;
  public config: DeepSeekConfig;

  constructor(config: DeepSeekConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      dangerouslyAllowBrowser: true,
    });
  }

  updateConfig(config: Partial<DeepSeekConfig>) {
    Object.assign(this.config, config);
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      dangerouslyAllowBrowser: true,
    });
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.client.models.list();
      const ids = response.data.map((m: any) => m.id);
      // Filter to relevant chat models, sort newest first
      const chatModels = ids.filter((id: string) =>
        id.startsWith("deepseek") && !id.includes("embed")
      );
      return chatModels.sort().reverse();
    } catch {
      return [];
    }
  }

  async chat(
    messages: ChatCompletionMessageParam[],
    tools?: ToolDefinition[],
  ): Promise<{
    content: string | null;
    reasoningContent: string | null;
    toolCalls: Array<{ id: string; name: string; arguments: string }> | null;
    usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    const body: Record<string, unknown> = {
      model: this.config.model,
      messages,
      stream: false,
    };

    if (this.config.thinkingEnabled) {
      body.reasoning_effort = this.config.reasoningEffort;
      body.thinking = { type: "enabled" };
    } else {
      body.thinking = { type: "disabled" };
      if (this.config.temperature !== undefined) {
        body.temperature = this.config.temperature;
      }
    }

    if (tools && tools.length > 0) {
      body.tools = tools;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (await this.client.chat.completions.create(body as any)) as any;

    const choice = response.choices?.[0];
    if (!choice) {
      return {
        content: null,
        reasoningContent: null,
        toolCalls: null,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }

    const message = choice.message ?? {};

    const toolCalls = message.tool_calls?.map(
      (tc: { id: string; function: { name: string; arguments: string } }) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: tc.function.arguments,
      }),
    ) ?? null;

    return {
      content: message.content ?? null,
      reasoningContent: (message as any).reasoning_content ?? null,
      toolCalls,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    };
  }

  async chatStream(
    messages: ChatCompletionMessageParam[],
    tools: ToolDefinition[] | undefined,
    onChunk: (chunk: {
      content: string;
      reasoningContent: string;
      toolCalls: Array<{ index: number; id: string; name: string; arguments: string }> | null;
      done: boolean;
    }) => void,
  ): Promise<{ usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
    const body: Record<string, unknown> = {
      model: this.config.model,
      messages,
      stream: true,
      stream_options: { include_usage: true },
    };

    if (this.config.thinkingEnabled) {
      body.reasoning_effort = this.config.reasoningEffort;
      body.thinking = { type: "enabled" };
    } else {
      body.thinking = { type: "disabled" };
      if (this.config.temperature !== undefined) {
        body.temperature = this.config.temperature;
      }
    }

    if (tools && tools.length > 0) {
      body.tools = tools;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = (await this.client.chat.completions.create(body as any)) as any;

    const toolCallAccumulators: Map<
      number,
      { id: string; name: string; arguments: string }
    > = new Map();
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    for await (const chunk of stream) {
      if (chunk.usage) {
        usage = {
          promptTokens: chunk.usage.prompt_tokens ?? 0,
          completionTokens: chunk.usage.completion_tokens ?? 0,
          totalTokens: chunk.usage.total_tokens ?? 0,
        };
      }

      const delta = chunk.choices?.[0]?.delta;
      if (!delta) continue;

      const content: string = delta.content ?? "";
      const reasoningContent: string = (delta as any).reasoning_content ?? "";

      let aggregatedToolCalls: Array<{
        index: number;
        id: string;
        name: string;
        arguments: string;
      }> | null = null;

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index as number;
          const existing = toolCallAccumulators.get(idx) ?? { id: "", name: "", arguments: "" };
          existing.id = tc.id ?? existing.id;
          existing.name = tc.function?.name ?? existing.name;
          existing.arguments = existing.arguments + (tc.function?.arguments ?? "");
          toolCallAccumulators.set(idx, existing);
        }
        aggregatedToolCalls = Array.from(toolCallAccumulators.entries()).map(
          ([index, v]) => ({ index, ...v }),
        );
      }

      const done =
        chunk.choices?.[0]?.finish_reason !== null &&
        chunk.choices?.[0]?.finish_reason !== undefined;

      onChunk({ content, reasoningContent, toolCalls: aggregatedToolCalls, done });
    }

    return { usage };
  }
}
