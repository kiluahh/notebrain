import { requestUrl } from "obsidian";
import type { RegisteredTool } from "./registry";

const API_URL = "https://api.tavily.com/search";

export const tavilySearchTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "tavilySearch",
      description:
        "Search the web using Tavily. Returns AI-curated results with titles, URLs, content snippets, and relevance scores. Use for up-to-date information, current events, and facts beyond your knowledge cutoff.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query string",
          },
          search_depth: {
            type: "string",
            enum: ["basic", "advanced"],
            description: "Search depth: 'basic' for fast results, 'advanced' for thorough search (default: basic)",
          },
          topic: {
            type: "string",
            enum: ["general", "news", "finance"],
            description: "Search topic category (default: general)",
          },
          max_results: {
            type: "integer",
            description: "Maximum number of results (1-20, default: 5)",
          },
          include_domains: {
            type: "array",
            items: { type: "string" },
            description: "Only include results from these domains",
          },
          exclude_domains: {
            type: "array",
            items: { type: "string" },
            description: "Exclude results from these domains",
          },
        },
        required: ["query"],
      },
    },
  },

  execute: async (args: Record<string, unknown>, apiKeys?: Record<string, string>) => {
    const query = args.query as string;
    if (!query?.trim()) return JSON.stringify({ error: "'query' is required" });

    const token = apiKeys?.tavilyKey || "";
    if (!token) return JSON.stringify({ error: "Tavily API key not configured. Set it in Settings → Tools." });

    const body: Record<string, unknown> = {
      query: query.trim(),
      search_depth: args.search_depth || "basic",
      max_results: Math.min(Math.max(Number(args.max_results) || 5, 1), 20),
    };
    if (args.topic) body.topic = args.topic;
    if (args.include_domains) body.include_domains = args.include_domains;
    if (args.exclude_domains) body.exclude_domains = args.exclude_domains;

    try {
      const res = await requestUrl({
        url: API_URL,
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.status !== 200) {
        if (res.status === 401) return JSON.stringify({ error: "Tavily API key invalid or expired (HTTP 401)" });
        if (res.status === 429) return JSON.stringify({ error: "Tavily rate limit exceeded (HTTP 429)" });
        return JSON.stringify({ error: `Tavily API error: HTTP ${res.status}` });
      }

      const data = res.json;
      const results = (data.results || []).map((r: any) => ({
        url: r.url,
        title: r.title,
        content: r.content,
        score: r.score,
      }));

      return JSON.stringify({
        query: data.query,
        response_time: data.response_time,
        answer: data.answer || null,
        results,
      });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "Tavily request failed" });
    }
  },
};
