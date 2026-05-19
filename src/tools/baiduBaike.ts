import { requestUrl } from "obsidian";
import type { RegisteredTool } from "./registry";

const APP_BUILDER_URL = "https://appbuilder.baidu.com/v2/baike/lemma/get_content";
const FREE_API_URL = "https://baike.baidu.com/api/openapi/BaikeLemmaCardApi";
const FREE_APPID = "379020";

export const baiduBaikeTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "baiduBaike",
      description:
        "Query Baidu Baike (百度百科) for encyclopedia entries by title. Returns structured info: abstract, card fields (birth/death/occupation etc.), related entries, and URL. Falls back to free public API if no AppBuilder key configured.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Entry name to search, e.g. '刘德华', '萧子响'.",
          },
        },
        required: ["query"],
      },
    },
  },

  execute: async (args: Record<string, unknown>, apiKeys?: Record<string, string>) => {
    const query = (args.query as string)?.trim();
    if (!query) return JSON.stringify({ error: "'query' is required" });

    const token = apiKeys?.baiduKey || "";

    // Try AppBuilder API first if key is configured
    if (token) {
      const result = await tryAppBuilder(query, token);
      if (result) return result;
    }

    // Fall back to free public API
    return await queryFreeApi(query);
  },
};

async function tryAppBuilder(query: string, token: string): Promise<string | null> {
  const url = `${APP_BUILDER_URL}?search_type=lemmaTitle&search_key=${encodeURIComponent(query)}`;
  try {
    const res = await requestUrl({
      url,
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (res.status !== 200) return null;
    const data = res.json;
    if (data.code && data.code !== 0 && data.code !== "0") return null;
    const r = data.result;
    if (!r) return null;

    return JSON.stringify({
      source: "appbuilder",
      title: r.lemma_title,
      id: r.lemma_id,
      desc: r.lemma_desc,
      summary: r.summary,
      url: r.url,
      image: r.pic_url || null,
      relations: (r.relations || []).map((rel: any) => ({
        name: rel.lemma_title,
        relation: rel.relation_name,
        id: rel.lemma_id,
        image: rel.square_pic_url || null,
      })),
      videos: (r.videos || []).map((v: any) => ({
        title: v.second_title,
        id: v.second_id,
        url: v.page_url,
        cover: v.cover_pic_url || null,
      })),
    });
  } catch {
    return null;
  }
}

async function queryFreeApi(query: string): Promise<string> {
  const url = `${FREE_API_URL}?appid=${FREE_APPID}&bk_key=${encodeURIComponent(query)}`;
  try {
    const res = await requestUrl({
      url,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json, text/plain, */*",
      },
    });
    if (res.status !== 200) {
      return JSON.stringify({ error: `Baike API HTTP ${res.status}` });
    }

    const data = res.json;
    if (!data || !data.title) {
      return JSON.stringify({ error: "No entry found for: " + query });
    }

    // Parse card fields into readable key-value pairs
    const fields: Record<string, string> = {};
    if (data.card) {
      for (const item of data.card as any[]) {
        const value = stripHtml(item.value?.[0] || item.format?.[0] || "");
        if (value) fields[item.name] = value;
      }
    }

    return JSON.stringify({
      source: "free_api",
      title: data.title,
      id: data.id,
      desc: data.desc || "",
      abstract: data.abstract || "",
      url: data.url || `https://baike.baidu.com/view/${data.id}.htm`,
      wapUrl: data.wapUrl || "",
      image: data.logo || null,
      fields,
    });
  } catch (e: any) {
    return JSON.stringify({ error: e.message || "Baike request failed" });
  }
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\\u([a-fA-F0-9]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .trim();
}
