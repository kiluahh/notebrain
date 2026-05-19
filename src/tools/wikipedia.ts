import { requestUrl } from "obsidian";
import type { RegisteredTool } from "./registry";

export const wikipediaTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "wikipedia",
      description:
        "Search Wikipedia or get article content. Supports 300+ languages via lang code. Typical workflow: (1) use mode='search' to find articles by keyword, (2) pick the best title from results, (3) use mode='article' with that title to get summary, (4) if user needs more detail, use full=true for complete article text. ALWAYS prefer this over webFetch for Wikipedia URLs — it's faster, cleaner, and free.",
      parameters: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["search", "article"],
            description: "Operation mode. 'search': find articles matching a keyword, returns title + snippet + wordcount + last edited. 'article': fetch content for a specific title, returns summary (description + first paragraph + thumbnail) or full extract if full=true.",
          },
          query: {
            type: "string",
            description: "Search keyword. Required for 'search' mode. Use the user's language. Examples: 'Transformer (deep learning)', '木星', 'Quantencomputing'.",
          },
          title: {
            type: "string",
            description: "Exact article title. Required for 'article' mode. MUST be the exact title from search results — spelling, capitalization, and punctuation matter. Examples: 'Transformer_(deep_learning)', '木星', 'Albert_Einstein'.",
          },
          lang: {
            type: "string",
            description: "Wikipedia language code. Default 'en'. Match the user's language: 'zh' for Chinese, 'ja' for Japanese, 'de' for German, 'fr' for French, etc. Search and article modes both respect this.",
          },
          full: {
            type: "boolean",
            description: "For 'article' mode only. false (default): returns summary (~2-3 paragraphs + thumbnail + description). true: returns full article text (up to 30k characters). Use true only when the user explicitly wants comprehensive detail.",
          },
          limit: {
            type: "integer",
            description: "For 'search' mode only. Max results to return (1-20, default 5). Use smaller values for focused queries, larger when the user wants to browse.",
          },
        },
        required: ["mode"],
      },
    },
  },

  execute: async (args: Record<string, unknown>) => {
    const mode = (args.mode as string) || "search";
    const lang = (args.lang as string) || "en";
    const base = `https://${lang}.wikipedia.org`;

    if (mode === "search") {
      const query = (args.query as string)?.trim();
      if (!query) return JSON.stringify({ error: "'query' is required for search mode" });
      const limit = Math.min(Math.max(Number(args.limit) || 5, 1), 20);
      return await doSearch(base, query, limit);
    }

    // article mode
    const title = (args.title as string)?.trim();
    if (!title) return JSON.stringify({ error: "'title' is required for article mode" });
    const full = !!(args.full);
    return full ? await doFullExtract(base, title) : await doSummary(base, title);
  },
};

async function doSearch(base: string, query: string, limit: number): Promise<string> {
  const url = `${base}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json`;
  try {
    const res = await requestUrl({ url, method: "GET" });
    if (res.status !== 200) return JSON.stringify({ error: `Wikipedia search HTTP ${res.status}` });
    const data = res.json;
    const total = data.query?.searchinfo?.totalhits || 0;
    const results = (data.query?.search || []).map((s: any) => ({
      title: s.title,
      snippet: stripTags(s.snippet || ""),
      wordcount: s.wordcount,
      timestamp: s.timestamp,
    }));
    return JSON.stringify({ total, results });
  } catch (e: any) {
    return JSON.stringify({ error: e.message || "Wikipedia search failed" });
  }
}

async function doSummary(base: string, title: string): Promise<string> {
  const url = `${base}/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  try {
    const res = await requestUrl({ url, method: "GET" });
    if (res.status !== 200) {
      if (res.status === 404) return JSON.stringify({ error: `Article not found: ${title}` });
      return JSON.stringify({ error: `Wikipedia summary HTTP ${res.status}` });
    }
    const d = res.json;
    return JSON.stringify({
      title: d.title,
      pageid: d.pageid,
      lang: d.lang,
      description: d.description || null,
      extract: d.extract || "",
      thumbnail: d.thumbnail?.source || null,
      url: d.content_urls?.desktop?.page || `https://${new URL(base).hostname}/wiki/${encodeURIComponent(title)}`,
    });
  } catch (e: any) {
    return JSON.stringify({ error: e.message || "Wikipedia summary failed" });
  }
}

async function doFullExtract(base: string, title: string): Promise<string> {
  const url = `${base}/w/api.php?action=query&prop=extracts&explaintext&exlimit=1&titles=${encodeURIComponent(title)}&format=json`;
  try {
    const res = await requestUrl({ url, method: "GET" });
    if (res.status !== 200) return JSON.stringify({ error: `Wikipedia extract HTTP ${res.status}` });
    const pages: any[] = Object.values(res.json.query?.pages || {});
    const page = pages[0];
    if (!page || page.missing) return JSON.stringify({ error: `Article not found: ${title}` });
    const extract = page.extract || "";
    return JSON.stringify({
      title: page.title,
      pageid: page.pageid,
      length: extract.length,
      extract: extract.slice(0, 30000),
      truncated: extract.length > 30000,
    });
  } catch (e: any) {
    return JSON.stringify({ error: e.message || "Wikipedia extract failed" });
  }
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim();
}
