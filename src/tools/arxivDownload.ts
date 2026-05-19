import { requestUrl, type App, type TFile } from "obsidian";
import type { RegisteredTool } from "./registry";
import { enforceArxivRateLimit } from "./arxivRateLimit";

let vaultApp: App | null = null;
export function setArxivVaultApp(app: App) {
  vaultApp = app;
}

export const arxivDownloadTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "arxivDownload",
      description:
        "Download an arXiv paper in HTML or PDF format. HTML returns clean article text for immediate reading. PDF is saved to vault root. Use arxivSearch first to find the paper ID.",
      parameters: {
        type: "object",
        properties: {
          paper_id: {
            type: "string",
            description: "arXiv paper ID, e.g. '2605.04948' or '2605.04948v1'. Obtain from arxivSearch results.",
          },
          format: {
            type: "string",
            enum: ["html", "pdf"],
            description: "Download format: 'html' (default, returns clean article text), 'pdf' (saves to vault root).",
          },
          preview: {
            type: "boolean",
            description: "For HTML only: true (default) returns content directly. false saves to vault as .md file.",
          },
        },
        required: ["paper_id"],
      },
    },
  },

  execute: async (args: Record<string, unknown>, _apiKeys?: Record<string, string>) => {
    const paperId = (args.paper_id as string)?.trim();
    if (!paperId) return JSON.stringify({ error: "'paper_id' is required (e.g. '2605.04948' or '2605.04948v1')" });

    const format = (args.format as string)?.toLowerCase() === "pdf" ? "pdf" : "html";
    const preview = args.preview !== undefined ? !!(args.preview) : format === "html";

    try {
      if (format === "html") {
        return await downloadHtml(paperId, preview);
      }
      return await downloadPdf(paperId);
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "arXiv download failed" });
    }
  },
};

async function downloadHtml(paperId: string, returnContent: boolean): Promise<string> {
  const url = `https://arxiv.org/html/${paperId}`;
  await enforceArxivRateLimit();
  const res = await requestUrl({ url, method: "GET" });
  if (res.status !== 200) {
    return JSON.stringify({ error: `HTTP ${res.status} fetching ${url}` });
  }

  const extracted = extractArticle(res.text, paperId);

  if (returnContent) {
    return JSON.stringify({
      paper_id: paperId,
      format: "html",
      source_url: url,
      content: extracted,
    });
  }

  // Save to vault as HTML
  const filename = `${paperId}.html`;

  if (vaultApp) {
    const existing = vaultApp.vault.getAbstractFileByPath(filename);
    if (existing) {
      await vaultApp.vault.modify(existing as TFile, extracted);
    } else {
      await vaultApp.vault.create(filename, extracted);
    }
  }

  return JSON.stringify({
    paper_id: paperId,
    format: "html",
    file_path: filename,
    message: `HTML saved to vault: ${filename}`,
  });
}

async function downloadPdf(paperId: string): Promise<string> {
  const url = `https://arxiv.org/pdf/${paperId}`;
  await enforceArxivRateLimit();
  const res = await requestUrl({ url, method: "GET" });
  if (res.status !== 200) {
    return JSON.stringify({ error: `HTTP ${res.status} fetching ${url}` });
  }

  const data = res.arrayBuffer;
  const filename = `${paperId}.pdf`;

  if (vaultApp) {
    const existing = vaultApp.vault.getAbstractFileByPath(filename);
    if (existing) {
      await vaultApp.vault.delete(existing);
    }
    await vaultApp.vault.createBinary(filename, data);
  }

  return JSON.stringify({
    paper_id: paperId,
    format: "pdf",
    file_path: filename,
    file_size: data.byteLength,
    message: `PDF saved to vault root. Reference as [[${filename}]]`,
  });
}

function extractArticle(html: string, _paperId: string): string {
  // Remove noise elements (same as reference: script, style, nav, header, footer, etc.)
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "");

  // Try to extract main article content (matching reference selectors)
  const selectors = [
    /<article[^>]*class="[^"]*ltx_document[^"]*"[\s\S]*?<\/article>/i,
    /<div[^>]*class="[^"]*ltx_page_content[^"]*"[\s\S]*?<\/div>/i,
    /<article[^>]*>[\s\S]*?<\/article>/i,
    /<main[^>]*>[\s\S]*?<\/main>/i,
    /<div[^>]*id="content"[^>]*>[\s\S]*?<\/div>/i,
  ];

  for (const sel of selectors) {
    const m = cleaned.match(sel);
    if (m) {
      return m[0]; // return raw HTML of the matching element
    }
  }

  // Fallback: return body or cleaned HTML as-is
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : cleaned;
}
