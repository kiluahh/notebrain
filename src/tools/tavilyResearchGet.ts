import type { RegisteredTool } from "./registry";
import { requestUrl } from "obsidian";

const API_URL = "https://api.tavily.com/research";

export const tavilyResearchGetTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "tavilyResearchGet",
      description:
        "Retrieve a completed research report by request_id from a previous tavilyResearch call. Use when research didn't complete within the initial polling timeout. Returns the report content, status, and sources.",
      parameters: {
        type: "object",
        properties: {
          request_id: { type: "string", description: "Request ID returned by tavilyResearch" },
        },
        required: ["request_id"],
      },
    },
  },

  execute: async (args: Record<string, unknown>, apiKeys?: Record<string, string>) => {
    const requestId = args.request_id as string;
    if (!requestId?.trim()) return JSON.stringify({ error: "'request_id' is required" });

    const token = apiKeys?.tavilyKey || "";
    if (!token) return JSON.stringify({ error: "Tavily API key not configured." });

    try {
      const res = await requestUrl({
        url: `${API_URL}/${requestId.trim()}`,
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (res.status !== 200) {
        if (res.status === 404) return JSON.stringify({ error: "Research request not found (HTTP 404)" });
        return JSON.stringify({ error: `Tavily Research Get error: HTTP ${res.status}` });
      }

      const data = res.json;

      return JSON.stringify({
        request_id: data.request_id,
        status: data.status,
        created_at: data.created_at,
        input: data.input,
        model: data.model,
        content: data.content,
        sources: (data.sources || []).map((s: any) => s.url || s),
        response_time: data.response_time,
      });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "Tavily Research Get failed" });
    }
  },
};
