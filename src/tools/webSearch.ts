import type { RegisteredTool } from "./registry";
import { fetchPage } from "./webFetch";

const MAX_RESULTS = 20;
const SEARCH_DELAY_MS = 2000;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchBaidu(query: string): Promise<string[]> {
  const url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}&rn=${MAX_RESULTS}`;
  try {
    const html = await fetchPage(url);

    // Baidu results are in <div class="result c-container"> or <div class="c-container">
    const results: string[] = [];
    // Match: title in <h3> and abstract/snippet
    const blockRe = /<div[^>]*class="[^"]*c-container[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*class="[^"]*c-container|<div[^>]*id="page|<script|$)/gi;
    let match;
    while ((match = blockRe.exec(html)) !== null && results.length < MAX_RESULTS) {
      const block = match[1];
      const titleMatch = block.match(/<a[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(/<span[^>]*class="[^"]*content-right_[^"]*"[^>]*>([\s\S]*?)<\/span>/) ||
        block.match(/<div[^>]*class="[^"]*c-abstract[^"]*"[^>]*>([\s\S]*?)<\/div>/) ||
        block.match(/<span[^>]*class="[^"]*c-color-text[^"]*"[^>]*>([\s\S]*?)<\/span>/);

      const title = stripHtml(titleMatch?.[1] || "");
      const snippet = stripHtml(snippetMatch?.[1] || "");
      if (title) results.push(`${title}\n  ${snippet}`);
    }
    return results;
  } catch {
    return [];
  }
}

async function searchBing(query: string): Promise<string[]> {
  const url = `https://cn.bing.com/search?q=${encodeURIComponent(query)}&count=${MAX_RESULTS}`;
  try {
    const html = await fetchPage(url);

    // Bing results in <li class="b_algo">
    const results: string[] = [];
    const blockRe = /<li[^>]*class="[^"]*b_algo[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
    let match;
    while ((match = blockRe.exec(html)) !== null && results.length < MAX_RESULTS) {
      const block = match[1];
      const titleMatch = block.match(/<a[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(/<p[^>]*class="[^"]*b_lineclamp[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
        block.match(/<p[^>]*>([\s\S]*?)<\/p>/);

      const title = stripHtml(titleMatch?.[1] || "");
      const snippet = stripHtml(snippetMatch?.[1] || "");
      if (title) results.push(`${title}\n  ${snippet}`);
    }
    return results;
  } catch {
    return [];
  }
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#?\w+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const webSearchTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "webSearch",
      description:
        "Free web search using Baidu and Bing. Requires at least 3 keywords for better results. Searches both engines for each keyword, aggregates and deduplicates results. No API key needed. 2s delay between keywords.",
      parameters: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: { type: "string" },
            description: "At least 3 search keyword strings. More specific keywords = better results. Example: ['AI news today', 'machine learning 2025', 'deep learning trends']",
          },
        },
        required: ["keywords"],
      },
    },
  },

  execute: async (args: Record<string, unknown>) => {
    const keywords = args.keywords as string[] | undefined;
    if (!keywords || keywords.length < 3) {
      return JSON.stringify({ error: "At least 3 keywords required. Use specific phrases for better results." });
    }

    const allResults: Array<{ source: string; keyword: string; result: string }> = [];

    for (let i = 0; i < keywords.length; i++) {
      const kw = keywords[i].trim();
      if (!kw) continue;

      // Search Baidu
      const baiduResults = await searchBaidu(kw);
      for (const r of baiduResults) {
        allResults.push({ source: "baidu", keyword: kw, result: r });
      }

      // Search Bing
      const bingResults = await searchBing(kw);
      for (const r of bingResults) {
        allResults.push({ source: "bing", keyword: kw, result: r });
      }

      // Delay between keywords (skip last)
      if (i < keywords.length - 1) {
        await delay(SEARCH_DELAY_MS);
      }
    }

    if (allResults.length === 0) {
      return JSON.stringify({ error: "No results found. Try different keywords." });
    }

    // Group results by keyword
    const grouped: Record<string, Array<{ source: string; result: string }>> = {};
    for (const r of allResults) {
      if (!grouped[r.keyword]) grouped[r.keyword] = [];
      grouped[r.keyword].push({ source: r.source, result: r.result });
    }

    return JSON.stringify({
      total: allResults.length,
      keywords: Object.keys(grouped).length,
      results: grouped,
    });
  },
};
