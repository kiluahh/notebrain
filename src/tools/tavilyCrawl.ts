import type { RegisteredTool } from "./registry";
import { requestUrl } from "obsidian";

const API_URL = "https://api.tavily.com/crawl";

export const tavilyCrawlTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "tavilyCrawl",
      description:
        "Crawl a website starting from a URL using Tavily. Follows links and extracts content from discovered pages with configurable depth/breadth. Use for deep research into a specific site or documentation.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "Root URL to start crawling from" },
          max_depth: { type: "integer", description: "Crawl depth 1-5 (default: 1). Higher = more pages" },
          max_breadth: { type: "integer", description: "Max links per page level 1-500 (default: 20)" },
          limit: { type: "integer", description: "Total pages to crawl (default: 50)" },
          instructions: { type: "string", description: "Natural language instructions for focused crawling, e.g. 'find API docs'" },
          select_paths: { type: "array", items: { type: "string" }, description: "Regex patterns to include matching URL paths" },
          exclude_paths: { type: "array", items: { type: "string" }, description: "Regex patterns to exclude matching URL paths" },
          extract_depth: { type: "string", enum: ["basic", "advanced"], description: "Extraction quality (default: basic)" },
          format: { type: "string", enum: ["markdown", "text"], description: "Output format (default: markdown)" },
          allow_external: { type: "boolean", description: "Allow crawling external domains (default: true)" },
          include_images: { type: "boolean", description: "Include image URLs (default: false)" },
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
      extract_depth: args.extract_depth || "basic",
      format: args.format || "markdown",
    };
    if (args.instructions) body.instructions = args.instructions;
    if (args.select_paths) body.select_paths = args.select_paths;
    if (args.exclude_paths) body.exclude_paths = args.exclude_paths;
    if (args.allow_external !== undefined) body.allow_external = args.allow_external;
    if (args.include_images !== undefined) body.include_images = args.include_images;

    try {
      const res = await requestUrl({
        url: API_URL,
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status !== 200) return JSON.stringify({ error: `Tavily Crawl error: HTTP ${res.status}` });

      const data = res.json;
      const results = (data.results || []).map((r: any) => ({
        url: r.url,
        content: (r.raw_content || r.content || "").slice(0, 5000),
      }));

      return JSON.stringify({ url: data.url, response_time: data.response_time, results_count: results.length, results });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "Tavily Crawl failed" });
    }
  },
};
