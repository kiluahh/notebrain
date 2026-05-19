import OpenAI from "openai";

export interface FimConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export class DeepSeekFimClient {
  private client: OpenAI;
  private config: FimConfig;

  constructor(config: FimConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl.replace(/\/+$/, "") + "/beta",
      dangerouslyAllowBrowser: true,
    });
  }

  async complete(
    prompt: string,
    suffix?: string,
    maxTokens?: number,
    temperature?: number,
  ): Promise<string> {
    const body: Record<string, unknown> = {
      model: this.config.model,
      prompt,
      max_tokens: maxTokens ?? 1024,
      temperature: temperature ?? 1.0,
    };
    if (suffix) body.suffix = suffix;

    const response: any = await this.client.completions.create(body as any);
    return response.choices?.[0]?.text ?? "";
  }
}
