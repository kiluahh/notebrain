import { requestUrl } from "obsidian";
import type { RegisteredTool } from "./registry";

const API_URL = "https://api.tavily.com/extract";

export const tavilyExtractTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "tavilyExtract",
      description:
        "Extract clean content (markdown or text) from one or more URLs using Tavily. Strips navigation, ads, and clutter. Supports up to 20 URLs per request. Use after tavilySearch to read full article content.",
      parameters: {
        type: "object",
        properties: {
          urls: {
            type: "array",
            items: { type: "string" },
            description: "List of URLs to extract content from (max 20)",
          },
          extract_depth: {
            type: "string",
            enum: ["basic", "advanced"],
            description: "'basic' for fast plain text, 'advanced' for complex JS-heavy pages (default: basic)",
          },
          format: {
            type: "string",
            enum: ["markdown", "text"],
            description: "Output format (default: markdown)",
          },
        },
        required: ["urls"],
      },
    },
  },

  execute: async (args: Record<string, unknown>, apiKeys?: Record<string, string>) => {
    const urls = args.urls as string[] | undefined;
    if (!urls || urls.length === 0) return JSON.stringify({ error: "'urls' is required" });

    const token = apiKeys?.tavilyKey || "";
    if (!token) return JSON.stringify({ error: "Tavily API key not configured." });

    const body: Record<string, unknown> = {
      urls: urls.slice(0, 20),
      extract_depth: args.extract_depth || "basic",
      format: args.format || "markdown",
    };

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
        return JSON.stringify({ error: `Tavily Extract error: HTTP ${res.status}` });
      }

      const data = res.json;

      const results = (data.results || []).map((r: any) => ({
        url: r.url,
        content: r.raw_content || r.content || "",
      }));

      // trim long content to avoid context overflow
      for (const r of results) {
        if (r.content.length > 8000) {
          r.content = r.content.slice(0, 8000) + "...[truncated]";
        }
      }

      return JSON.stringify({
        results,
        failed_results: data.failed_results || [],
        response_time: data.response_time,
      });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "Tavily Extract failed" });
    }
  },
};
