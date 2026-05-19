import type { RegisteredTool } from "./registry";
import { requestUrl } from "obsidian";

const API_URL = "https://api.tavily.com/map";

export const tavilyMapTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "tavilyMap",
      description:
        "Discover the URL structure of a website using Tavily Map. Returns a list of discovered URLs without page content. Ideal for site discovery before using tavilyExtract on specific pages.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "Root URL to start mapping from" },
          max_depth: { type: "integer", description: "Mapping depth 1-5 (default: 1)" },
          max_breadth: { type: "integer", description: "Max links per page 1-500 (default: 20)" },
          limit: { type: "integer", description: "Total URLs to discover (default: 50)" },
          instructions: { type: "string", description: "Natural language instructions for focused mapping, e.g. 'find API docs'" },
          select_paths: { type: "array", items: { type: "string" }, description: "Regex patterns to include matching URL paths" },
          exclude_paths: { type: "array", items: { type: "string" }, description: "Regex patterns to exclude matching URL paths" },
          allow_external: { type: "boolean", description: "Allow mapping external domains (default: true)" },
        },
        required: ["url"],
      },
    },
  },

  execute: async (args: Record<string, unknown>, apiKeys?: Record<string, string>) => {
    const url = args.url as string;
    if (!url?.trim()) return JSON.stringify({ error: "'url' is required" });

    const token = apiKeys?.tavilyKey || "";
    if (!token) return JSON.stringify({ error: "Tavily API key not configured." });

    const body: Record<string, unknown> = {
      url: url.trim(),
      max_depth: Math.min(Math.max(Number(args.max_depth) || 1, 1), 5),
      max_breadth: Math.min(Math.max(Number(args.max_breadth) || 20, 1), 500),
      limit: Math.max(Number(args.limit) || 50, 1),
    };
    if (args.instructions) body.instructions = args.instructions;
    if (args.select_paths) body.select_paths = args.select_paths;
    if (args.exclude_paths) body.exclude_paths = args.exclude_paths;
    if (args.allow_external !== undefined) body.allow_external = args.allow_external;

    try {
      const res = await requestUrl({
        url: API_URL,
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status !== 200) {
        if (res.status === 401) return JSON.stringify({ error: "Tavily API key invalid or expired (HTTP 401)" });
        if (res.status === 429) return JSON.stringify({ error: "Tavily API rate limit exceeded (HTTP 429)" });
        return JSON.stringify({ error: `Tavily Map error: HTTP ${res.status}` });
      }

      const data = res.json;

      return JSON.stringify({
        base_url: data.base_url || url,
        response_time: data.response_time,
        results: data.results || [],
      });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "Tavily Map failed" });
    }
  },
};
