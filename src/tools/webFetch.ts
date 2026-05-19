import { requestUrl } from "obsidian";
import type { RegisteredTool } from "./registry";

const MAX_CONTENT_LENGTH = 50_000;

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

const NON_CONTENT_SELECTORS = [
  "script", "style", "nav", "footer", "header", "aside",
  "noscript", "iframe", "form", "svg", "canvas",
  "[role=navigation]", "[role=banner]", "[role=contentinfo]",
  "[aria-hidden=true]", ".sidebar", ".nav", ".navigation",
  ".footer", ".header", ".menu", ".advertisement", ".ad", ".ads",
];

const MAIN_SELECTORS = [
  "article", "main", "[role=main]",
  ".post-content", ".article-content", ".entry-content",
  "#content", "#article", ".markdown-body",
  "div.post", "div.article",
];

let headlessEndpoint = "";

export function setWebFetchConfig(cfg: { headlessBrowserEndpoint: string }) {
  headlessEndpoint = cfg.headlessBrowserEndpoint || "";
}

export const webFetchTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "webFetch",
      description:
        "Fetch and extract readable content from a web page. Set renderJs=true for JavaScript-rendered pages (uses built-in free renderer — works on all platforms, no setup needed). Without renderJs, does fast static HTML extraction.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The full URL to fetch (must start with http:// or https://)",
          },
          extract_mode: {
            type: "string",
            enum: ["text", "markdown"],
            description: "Output format: 'text' for plain text, 'markdown' for formatted output (default: text)",
          },
          renderJs: {
            type: "boolean",
            description: "If true, renders the page with a headless browser first (built-in free renderer, no setup needed). Default: false.",
          },
          collectLinks: {
            type: "boolean",
            description: "If true, also collect and return all secondary links (href URLs) found on the page. Default: false.",
          },
        },
        required: ["url"],
      },
    },
  },

  execute: async (args: Record<string, unknown>, _apiKeys?: Record<string, string>) => {
    const url = args.url as string;
    if (!url) return JSON.stringify({ error: "'url' is required" });
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return JSON.stringify({ error: "invalid URL: must start with http:// or https://" });
    }
    const mode = ((args.extract_mode as string) || "text").toLowerCase();
    const renderJs = !!args.renderJs;
    const collectLinks = !!args.collectLinks;

    try {
      if (renderJs) {
        return await fetchRendered(url, mode, collectLinks);
      }
      const html = await fetchPage(url);
      return extractContent(html, url, mode, collectLinks);
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "web_fetch failed" });
    }
  },
};

export async function fetchPage(url: string): Promise<string> {
  const res = await requestUrl({
    url,
    method: "GET",
    headers: BROWSER_HEADERS,
  });

  if (res.status !== 200) {
    throw new Error(`HTTP ${res.status}`);
  }

  const contentType = (res.headers["content-type"] || "").toLowerCase();
  if (
    contentType &&
    !contentType.includes("text/html") &&
    !contentType.includes("text/plain") &&
    !contentType.includes("application/xhtml")
  ) {
    throw new Error(`Unsupported content type: ${contentType}. Only HTML/text pages are supported.`);
  }

  return res.text;
}

// --- Headless browser rendering ---

// Built-in rendering services (free, no auth required, work on all platforms)
const DEFAULT_RENDERERS = [
  {
    name: "jina",
    buildUrl: (url: string) => `https://r.jina.ai/${url}`,
    extract: (text: string, _url: string, _mode: string, collectLinks?: boolean) => {
      if (!collectLinks) return text;
      const linkRe = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
      const links: string[] = [];
      let m;
      while ((m = linkRe.exec(text)) !== null) {
        if (!links.includes(m[2])) links.push(m[2]);
        if (links.length >= 200) break;
      }
      return links.length > 0
        ? `[Page links] (${links.length} found)\n${links.map((l) => `  - ${l}`).join("\n")}\n\n${text}`
        : text;
    },
  },
];

async function fetchRendered(url: string, mode: string, collectLinks: boolean): Promise<string> {
  // 1. Use user-configured endpoint if set
  if (headlessEndpoint) {
    try {
      const isGetStyle = headlessEndpoint.includes("?") || headlessEndpoint.endsWith("/render");
      if (isGetStyle) {
        const sep = headlessEndpoint.includes("?") ? "&" : "?";
        const renderUrl = `${headlessEndpoint}${sep}url=${encodeURIComponent(url)}`;
        const res = await requestUrl({ url: renderUrl, method: "GET" });
        if (res.status === 200) return extractContent(res.text, url, mode, collectLinks);
        throw new Error(`HTTP ${res.status}`);
      }
      const res = await requestUrl({
        url: headlessEndpoint,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.status === 200) return extractContent(res.text, url, mode, collectLinks);
      throw new Error(`HTTP ${res.status}`);
    } catch (e: any) {
      // Custom endpoint failed — fall through to default renderers
    }
  }

  // 2. Try built-in free renderers
  for (const renderer of DEFAULT_RENDERERS) {
    try {
      const renderUrl = renderer.buildUrl(url);
      const res = await requestUrl({
        url: renderUrl,
        method: "GET",
        headers: {
          "Accept": "text/markdown, text/plain, */*",
          "User-Agent": "Mozilla/5.0 (compatible; Notebrain/1.0)",
        },
      });
      if (res.status === 200) {
        return renderer.extract(res.text, url, mode, collectLinks);
      }
    } catch { /* try next renderer */ }
  }

  // 3. All renderers failed — fall back to static extraction
  try {
    const html = await fetchPage(url);
    return extractContent(html, url, mode, collectLinks);
  } catch (e: any) {
    return JSON.stringify({ error: `Page fetch failed: ${e.message || "unknown error"}. Static extraction also failed.` });
  }
}

// --- Content extraction ---

function extractContent(html: string, baseUrl: string, mode: string, collectLinks?: boolean): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Extract structured data from script tags before removing them
  const inlineData = extractInlineData(doc);

  // Remove non-content elements
  for (const sel of NON_CONTENT_SELECTORS) {
    try {
      doc.querySelectorAll(sel).forEach((el) => el.remove());
    } catch { /* skip */ }
  }

  // Find main content
  let contentRoot: Element | null = null;
  for (const sel of MAIN_SELECTORS) {
    try {
      contentRoot = doc.querySelector(sel);
      if (contentRoot) break;
    } catch { /* skip */ }
  }
  if (!contentRoot) contentRoot = doc.body;
  if (!contentRoot) return "No readable content found on this page.";

  // Collect links from content area only (after non-content stripped)
  let linksSection = "";
  if (collectLinks) {
    const links = collectPageLinks(contentRoot, baseUrl);
    if (links.length > 0) {
      linksSection = `\n[Page links] (${links.length} found)\n${links.map((l) => `  - ${l}`).join("\n")}\n`;
    }
  }

  let extracted: string;
  if (mode === "markdown") {
    extracted = htmlToMarkdown(contentRoot, baseUrl);
  } else {
    extracted = contentRoot.textContent || "";
  }

  // Prepend inline data and links if found
  if (linksSection || inlineData) {
    extracted = `${linksSection}${inlineData ? `[Structured data from page]\n${inlineData}\n\n` : ""}[Page content]\n${extracted}`;
  }

  // Normalize whitespace
  extracted = extracted
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (extracted.length > MAX_CONTENT_LENGTH) {
    extracted = extracted.slice(0, MAX_CONTENT_LENGTH) + "\n\n[Content truncated at 50,000 characters...]";
  }

  return extracted;
}

function collectPageLinks(root: Element | Document, baseUrl: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const anchors = root.querySelectorAll("a[href]");
  for (const a of anchors) {
    const raw = a.getAttribute("href") || "";
    if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) continue;
    const resolved = resolveUrl(raw, baseUrl);
    if (!resolved || !/^https?:\/\//i.test(resolved)) continue;
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    result.push(resolved);
    if (result.length >= 200) break;
  }
  return result;
}

// Extract JSON-LD, Next.js/Nuxt/Redux state from script tags
function extractInlineData(doc: Document): string | null {
  const parts: string[] = [];
  const scripts = doc.querySelectorAll("script");

  // Known JSON data patterns in script tags
  const dataSelectors: Array<{ selector: string; label: string }> = [
    { selector: 'script[type="application/ld+json"]', label: "JSON-LD" },
    { selector: 'script[type="application/json"]', label: "JSON Data" },
    { selector: "script#__NEXT_DATA__", label: "Next.js Data" },
    { selector: "script#__NUXT_DATA__", label: "Nuxt Data" },
  ];

  for (const { selector, label } of dataSelectors) {
    try {
      const els = doc.querySelectorAll(selector);
      for (const el of els) {
        const text = el.textContent?.trim();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            const summary = summarizeJson(parsed, label);
            if (summary) parts.push(summary);
          } catch {
            // Not valid JSON, skip
          }
        }
      }
    } catch { /* skip */ }
  }

  // Also check for window.__INITIAL_STATE__, __REDUX_STATE__, etc. in regular scripts
  const stateRegex = /window\.__(?:INITIAL|REDUX|APP)_(?:STATE|DATA)__\s*=\s*({.+?});/s;
  const allScripts = Array.from(scripts);
  for (const s of allScripts) {
    const text = s.textContent || "";
    const match = text.match(stateRegex);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        const summary = summarizeJson(parsed, "App State");
        if (summary) parts.push(summary);
      } catch { /* not valid JSON */ }
    }
  }

  return parts.length > 0 ? parts.join("\n") : null;
}

function summarizeJson(data: any, label: string, depth = 0): string | null {
  if (depth > 4) return null;
  if (data === null || data === undefined) return null;

  if (typeof data === "string") {
    return data.length > 500 ? `${label}: ${data.slice(0, 500)}...` : `${label}: ${data}`;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return null;
    const items = data.slice(0, 5).map((item) => {
      if (typeof item === "object") return summarizeJson(item, "", depth + 1);
      return String(item).slice(0, 100);
    }).filter(Boolean);
    return `${label} (${data.length} items):\n${items.map((i) => `  - ${i}`).join("\n")}`;
  }

  if (typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length === 0) return null;
    // Extract meaningful text fields
    const textKeys = ["name", "title", "description", "headline", "text", "content", "summary", "body", "articleBody", "abstract"];
    const extracted: string[] = [];
    for (const k of textKeys) {
      if (data[k] && typeof data[k] === "string" && data[k].length > 10) {
        extracted.push(`${k}: ${data[k].slice(0, 200)}`);
      }
    }
    if (extracted.length > 0) {
      return `${label}:\n${extracted.map((e) => `  - ${e}`).join("\n")}`;
    }
    // Fallback: just list keys
    return `${label} fields: ${keys.join(", ")}`;
  }

  return `${label}: ${String(data).slice(0, 200)}`;
}

// --- Markdown converter ---

function htmlToMarkdown(root: Element, baseUrl: string): string {
  const sb: string[] = [];
  appendMarkdown(sb, root, baseUrl);
  return sb.join("").trim();
}

function appendMarkdown(sb: string[], node: Node, baseUrl: string) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent || "").trim();
    if (text) sb.push(text);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    case "h1": blockTag(sb, el, baseUrl, "# "); break;
    case "h2": blockTag(sb, el, baseUrl, "## "); break;
    case "h3": blockTag(sb, el, baseUrl, "### "); break;
    case "h4": blockTag(sb, el, baseUrl, "#### "); break;
    case "h5": blockTag(sb, el, baseUrl, "##### "); break;
    case "h6": blockTag(sb, el, baseUrl, "###### "); break;
    case "p": { sb.push("\n\n"); traverseChildren(sb, el, baseUrl); sb.push("\n"); break; }
    case "br": sb.push("\n"); break;
    case "strong": case "b": { sb.push("**"); traverseChildren(sb, el, baseUrl); sb.push("**"); break; }
    case "em": case "i": { sb.push("*"); traverseChildren(sb, el, baseUrl); sb.push("*"); break; }
    case "a": {
      const href = resolveUrl(el.getAttribute("href"), baseUrl);
      sb.push("[");
      traverseChildren(sb, el, baseUrl);
      sb.push(`](${href})`);
      break;
    }
    case "img": {
      const src = resolveUrl(el.getAttribute("src"), baseUrl);
      const alt = el.getAttribute("alt") || "";
      sb.push(`\n\n![${alt}](${src})\n\n`);
      break;
    }
    case "ul": { sb.push("\n"); traverseChildren(sb, el, baseUrl); sb.push("\n"); break; }
    case "ol": { sb.push("\n"); traverseChildren(sb, el, baseUrl); sb.push("\n"); break; }
    case "li": { sb.push("- "); traverseChildren(sb, el, baseUrl); sb.push("\n"); break; }
    case "pre": case "code": {
      const code = el.textContent?.trim() || "";
      if (code) sb.push(`\n\`\`\`\n${code}\n\`\`\`\n`);
      break;
    }
    case "blockquote": {
      const inner = el.textContent || "";
      inner.split("\n").forEach((line) => sb.push(`> ${line}\n`));
      break;
    }
    case "hr": sb.push("\n\n---\n\n"); break;
    default: traverseChildren(sb, el, baseUrl); break;
  }
}

function blockTag(sb: string[], el: Element, baseUrl: string, prefix: string) {
  sb.push(`\n\n${prefix}`);
  traverseChildren(sb, el, baseUrl);
  sb.push("\n");
}

function traverseChildren(sb: string[], parent: Node, baseUrl: string) {
  parent.childNodes.forEach((child) => appendMarkdown(sb, child, baseUrl));
}

function resolveUrl(raw: string | null, baseUrl: string): string {
  if (!raw) return "";
  try {
    return new URL(raw, baseUrl).href;
  } catch {
    return raw;
  }
}
