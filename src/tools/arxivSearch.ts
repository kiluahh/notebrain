import { requestUrl } from "obsidian";
import type { RegisteredTool } from "./registry";
import { enforceArxivRateLimit } from "./arxivRateLimit";

const API_URL = "https://export.arxiv.org/api/query";

interface ArxivPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  categories: string[];
  primary_category: string;
  pdf_url: string;
  html_url: string;
  published: string;
  updated: string;
  comment: string;
}

function parseAtomXml(xml: string, startOffset: number) {
  // simple regex-based parser for arXiv Atom XML
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  const papers: ArxivPaper[] = [];
  const totalResultsMatch = xml.match(/<opensearch:totalResults[^>]*>(\d+)<\/opensearch:totalResults>/);
  const totalResults = totalResultsMatch ? parseInt(totalResultsMatch[1], 10) : 0;

  let entryMatch: RegExpExecArray | null;
  while ((entryMatch = entryRe.exec(xml)) !== null) {
    const entry = entryMatch[1];
    const paper: ArxivPaper = {
      id: extractTag(entry, "id")?.split("/abs/").pop() || "",
      title: extractTag(entry, "title")?.replace(/\s+/g, " ").trim() || "",
      abstract: extractTag(entry, "summary")?.replace(/\s+/g, " ").trim() || "",
      authors: [],
      categories: [],
      primary_category: "",
      pdf_url: "",
      html_url: "",
      published: extractTag(entry, "published") || "",
      updated: extractTag(entry, "updated") || "",
      comment: extractTag(entry, "arxiv:comment") || "",
    };

    // authors
    const authorRe = /<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g;
    let authorMatch: RegExpExecArray | null;
    while ((authorMatch = authorRe.exec(entry)) !== null) {
      paper.authors.push(authorMatch[1].trim());
    }

    // categories
    const catRe = /<category[^>]*term="([^"]+)"/g;
    let catMatch: RegExpExecArray | null;
    while ((catMatch = catRe.exec(entry)) !== null) {
      paper.categories.push(catMatch[1]);
    }

    // primary category
    const primaryMatch = entry.match(/<arxiv:primary_category[^>]*term="([^"]+)"/);
    if (primaryMatch) paper.primary_category = primaryMatch[1];

    // links
    const linkRe = /<link[^>]*href="([^"]+)"[^>]*title="([^"]*)"[^>]*type="([^"]*)"[^>]*\/>/g;
    let linkMatch: RegExpExecArray | null;
    while ((linkMatch = linkRe.exec(entry)) !== null) {
      const href = linkMatch[1];
      const title = linkMatch[2];
      const type = linkMatch[3];
      if (title === "pdf" || type === "application/pdf") paper.pdf_url = href;
      if (!paper.pdf_url && href.endsWith(".pdf")) paper.pdf_url = href;
    }

    // html URL: construct from ID
    if (!paper.html_url && paper.id) {
      paper.html_url = `https://arxiv.org/abs/${paper.id}`;
    }

    papers.push(paper);
  }

  return { totalResults, start: startOffset, papers };
}

function extractTag(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1] : undefined;
}

export const arxivSearchTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "arxivSearch",
      description:
        "Search arXiv for academic papers. Supports fielded queries (ti:title, au:author, abs:abstract, cat:category, all:all fields), boolean operators (AND, OR, ANDNOT), and ID lookup via id_list. Use for research and academic literature discovery. IMPORTANT: arXiv requires 3 seconds between requests.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query with field prefixes (ti:, au:, abs:, cat:, all:), boolean operators (AND, OR, ANDNOT). Example: 'au:\"Geoffrey Hinton\" AND cat:cs.LG'. Required unless id_list is provided.",
          },
          id_list: {
            type: "string",
            description: "Comma-separated arXiv IDs, e.g. '2301.12345,2302.67890'. Required unless query is provided.",
          },
          start: {
            type: "integer",
            description: "Pagination offset, 0-based (default: 0)",
          },
          max_results: {
            type: "integer",
            description: "Max results (1-50, default: 5)",
          },
          sort_by: {
            type: "string",
            enum: ["relevance", "lastUpdatedDate", "submittedDate"],
            description: "Sort field (default: relevance)",
          },
          sort_order: {
            type: "string",
            enum: ["ascending", "descending"],
            description: "Sort direction (default: descending)",
          },
        },
      },
    },
  },

  execute: async (args: Record<string, unknown>, _apiKeys?: Record<string, string>) => {
    const query = args.query as string | undefined;
    const idList = args.id_list as string | undefined;
    if (!query?.trim() && !idList?.trim()) {
      return JSON.stringify({ error: "Either 'query' or 'id_list' is required" });
    }

    const start = Math.max(Number(args.start) || 0, 0);
    const maxResults = Math.min(Math.max(Number(args.max_results) || 5, 1), 50);
    const sortBy = ["relevance", "lastUpdatedDate", "submittedDate"].includes(args.sort_by as string)
      ? (args.sort_by as string) : "relevance";
    const sortOrder = args.sort_order === "ascending" ? "ascending" : "descending";

    await enforceArxivRateLimit();

    const params = new URLSearchParams();
    if (query?.trim()) params.set("search_query", query.trim());
    if (idList?.trim()) params.set("id_list", idList.trim());
    params.set("start", String(start));
    params.set("max_results", String(maxResults));
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    const url = `${API_URL}?${params.toString()}`;

    try {
      const res = await requestUrl({ url, method: "GET" });
      if (res.status !== 200) return JSON.stringify({ error: `arXiv API error: HTTP ${res.status}` });

      const xml = res.text;
      const result = parseAtomXml(xml, start);

      return JSON.stringify({
        total_results: result.totalResults,
        start: result.start,
        papers: result.papers.slice(0, maxResults).map((p) => ({
          id: p.id,
          title: p.title,
          authors: p.authors,
          abstract: p.abstract,
          categories: p.categories,
          primary_category: p.primary_category,
          pdf_url: p.pdf_url || null,
          html_url: p.html_url || null,
          published: p.published,
          updated: p.updated,
          comment: p.comment || null,
        })),
      });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "arXiv request failed" });
    }
  },
};
