import type { RegisteredTool } from "./registry";
import { requestUrl } from "obsidian";

export const githubSearchTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "githubSearch",
      description:
        "Search GitHub via the REST API. Supports repositories, commits, issues (includes PRs), users, code, topics, and labels. Use search qualifiers like language:typescript, stars:>100, is:public, path:src, etc. Does NOT require authentication (lower rate limit without token).",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query. Supports GitHub qualifiers: language:python, stars:>100, fork:true, is:public, path:src, user:name, org:name, etc.",
          },
          type: {
            type: "string",
            enum: ["repositories", "commits", "issues", "users", "code", "topics", "labels"],
            description: "Type of search (default: repositories)",
          },
          sort: {
            type: "string",
            description: "Sort field. Varies by type: repositories→stars/forks/updated, issues→comments/created/updated, users→followers/joined/repositories. Omit for best match.",
          },
          order: {
            type: "string",
            enum: ["desc", "asc"],
            description: "Sort direction (default: desc)",
          },
          page: {
            type: "integer",
            description: "Page number, 1-based (default: 1)",
          },
          per_page: {
            type: "integer",
            description: "Results per page, max 100 (default: 20)",
          },
        },
        required: ["query"],
      },
    },
  },

  execute: async (args: Record<string, unknown>, apiKeys?: Record<string, string>) => {
    const query = args.query as string;
    if (!query?.trim()) return JSON.stringify({ error: "'query' is required" });

    const searchType = (["repositories", "commits", "issues", "users", "code", "topics", "labels"].includes(args.type as string) ? args.type : "repositories") as string;
    const sort = args.sort as string | undefined;
    const order = args.order === "asc" ? "asc" : "desc";
    const page = Math.max(Number(args.page) || 1, 1);
    const perPage = Math.min(Math.max(Number(args.per_page) || 20, 1), 100);

    const params = new URLSearchParams();
    params.set("q", query.trim());
    params.set("order", order);
    params.set("page", String(page));
    params.set("per_page", String(perPage));
    if (sort) params.set("sort", sort);

    const url = `https://api.github.com/search/${searchType}?${params.toString()}`;

    try {
      const headers: Record<string, string> = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };
      if (apiKeys?.githubKey) headers["Authorization"] = `Bearer ${apiKeys.githubKey}`;

      const res = await requestUrl({ url, headers });

      if (res.status !== 200) {
        if (res.status === 401) return JSON.stringify({ error: "GitHub token invalid (HTTP 401)" });
        if (res.status === 403) {
          const remaining = res.headers["x-ratelimit-remaining"];
          if (remaining === "0") return JSON.stringify({ error: "GitHub API rate limit exceeded. Wait or use a token." });
          return JSON.stringify({ error: "GitHub API forbidden (HTTP 403)" });
        }
        if (res.status === 422) return JSON.stringify({ error: "GitHub validation failed. Check query syntax." });
        return JSON.stringify({ error: `GitHub API error: HTTP ${res.status}` });
      }

      const data = res.json;
      const totalCount = data.total_count || 0;
      const items = (data.items || []).slice(0, 20).map((item: any) => {
        const entry: Record<string, unknown> = {};
        for (const key of Object.keys(item).slice(0, 15)) {
          const val = item[key];
          if (val === null) continue;
          if (typeof val === "object" && !Array.isArray(val)) {
            entry[key] = val.login || val.name || val.full_name || val.html_url || val.description || "[object]";
          } else {
            entry[key] = val;
          }
        }
        return entry;
      });

      return JSON.stringify({ total_count: totalCount, page, per_page: perPage, results: items });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "GitHub request failed" });
    }
  },
};
