import type { RegisteredTool } from "./registry";
import { requestUrl } from "obsidian";

const API_URL = "https://api.tavily.com/research";

async function pollResearch(token: string, requestId: string): Promise<string> {
  const maxTime = 180_000; // 3 min
  const interval = 5000;
  const start = Date.now();

  while (Date.now() - start < maxTime) {
    await new Promise((r) => setTimeout(r, interval));
    try {
      const res = await requestUrl({
        url: `${API_URL}/${requestId}`,
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.status !== 200) {
        return JSON.stringify({ error: `Research poll error: HTTP ${res.status}`, request_id: requestId });
      }
      const data = res.json;
      if (data.status === "completed") {
        return JSON.stringify({
          request_id: data.request_id,
          status: data.status,
          input: data.input,
          model: data.model,
          content: data.content,
          sources: (data.sources || []).map((s: any) => s.url || s),
          response_time: data.response_time,
        });
      }
      if (data.status === "failed" || data.status === "error") {
        return JSON.stringify({ error: `Research ${data.status}`, request_id: requestId, status: data.status });
      }
    } catch (e: any) {
      return JSON.stringify({ error: e.message, request_id: requestId });
    }
  }

  return JSON.stringify({
    request_id: requestId,
    status: "pending",
    message: "Research still in progress. Use tavilyResearchGet with this request_id to retrieve results later.",
  });
}

export const tavilyResearchTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "tavilyResearch",
      description:
        "Perform comprehensive multi-step research on a topic using Tavily Research. Submits a query, polls for completion (up to 3 min), and returns an AI-generated report with sources. For long-running research, use tavilyResearchGet with the returned request_id.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Research topic or question" },
          model: { type: "string", enum: ["auto", "mini", "pro"], description: "Research depth (default: auto)" },
          citation_format: { type: "string", enum: ["numbered", "mla", "apa", "chicago"], description: "Citation style (default: numbered)" },
        },
        required: ["query"],
      },
    },
  },

  execute: async (args: Record<string, unknown>, apiKeys?: Record<string, string>) => {
    const query = args.query as string;
    if (!query?.trim()) return JSON.stringify({ error: "'query' is required" });

    const token = apiKeys?.tavilyKey || "";
    if (!token) return JSON.stringify({ error: "Tavily API key not configured." });

    const body: Record<string, unknown> = {
      input: query.trim(),
      model: args.model || "auto",
      citation_format: args.citation_format || "numbered",
    };

    try {
      const res = await requestUrl({
        url: API_URL,
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status !== 200) {
        return JSON.stringify({ error: `Tavily Research error: HTTP ${res.status}` });
      }

      const data = res.json;

      // If already completed (202 or immediate response)
      if (data.status === "completed") {
        return JSON.stringify({
          request_id: data.request_id,
          status: "completed",
          input: data.input,
          model: data.model,
          content: data.content,
          sources: (data.sources || []).map((s: any) => s.url || s),
          response_time: data.response_time,
        });
      }

      // Poll for result
      const requestId = data.request_id;
      if (!requestId) {
        return JSON.stringify({ error: "No request_id returned", raw: JSON.stringify(data).slice(0, 500) });
      }

      return await pollResearch(token, requestId);
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "Tavily Research failed" });
    }
  },
};
