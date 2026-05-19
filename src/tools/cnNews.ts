import type { RegisteredTool } from "./registry";
import { fetchPage } from "./webFetch";

const SITES: Array<{ name: string; url: string; tier: number }> = [
  { name: "新华网", url: "https://www.xinhuanet.com", tier: 1 },
  { name: "人民网", url: "https://www.people.com.cn", tier: 1 },
  { name: "央视网", url: "https://www.cctv.com", tier: 1 },
  { name: "网易新闻", url: "https://news.163.com", tier: 1 },
  { name: "新浪新闻", url: "https://news.sina.com.cn", tier: 1 },
  { name: "中国军网", url: "http://www.81.cn", tier: 1 },
  { name: "南方网", url: "https://www.southcn.com", tier: 1 },
  { name: "红网", url: "https://www.rednet.cn", tier: 1 },
  { name: "观察者网", url: "https://www.guancha.cn", tier: 1 },
  { name: "光明网", url: "https://www.gmw.cn", tier: 1 },
  { name: "中国新闻网", url: "https://www.chinanews.com.cn", tier: 2 },
  { name: "凤凰网", url: "https://www.ifeng.com", tier: 2 },
  { name: "中国经济网", url: "https://www.ce.cn", tier: 2 },
  { name: "中国日报网", url: "https://www.chinadaily.com.cn", tier: 2 },
  { name: "澎湃新闻", url: "https://www.thepaper.cn", tier: 2 },
  { name: "财新网", url: "https://www.caixin.com", tier: 2 },
  { name: "国际在线", url: "https://www.cri.cn", tier: 2 },
  { name: "人民政协网", url: "https://www.rmzxb.com.cn", tier: 2 },
  { name: "华龙网", url: "https://www.cqnews.net", tier: 2 },
  { name: "齐鲁网", url: "https://www.iqilu.com", tier: 2 },
  { name: "大河网", url: "https://www.dahe.cn", tier: 2 },
  { name: "搜狐新闻", url: "https://news.sohu.com", tier: 2 },
  { name: "海外网", url: "https://www.haiwainet.cn", tier: 2 },
];

const CONCURRENCY = 3;
const MAX_ARTICLES_PER_SITE = 3;
const ARTICLE_TRUNCATE = 500;

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&#?\w+;/g, "").replace(/\s+/g, " ").trim();
}

interface Link {
  text: string;
  href: string;
}

function resolveUrl(raw: string | null, baseUrl: string): string {
  if (!raw) return "";
  try { return new URL(raw, baseUrl).href; } catch { return raw; }
}

// Only accept text with Chinese characters (filter out language-switch links)
function hasChinese(text: string): boolean {
  return /[一-鿿]/.test(text);
}

// Non-news patterns to exclude
const NON_NEWS_RE = /公开课|邮箱|VIP|付费|下载|客户端|APP|服务平台|辟谣平台|政府网站|国务院|网上办事|政务公开|政务服务|注册|登录/;

// Check if URL looks like a news article
function looksLikeArticle(href: string, baseUrl: string): boolean {
  const path = href.replace(baseUrl, "").replace(/^https?:\/\/[^/]+/, "");
  if (/\d{4}[-/]?\d{1,2}[-/]?\d{1,2}/.test(path)) return true;
  if (/\/c\.html|\/detail\/|\/news\/|\/a\/|article\/|[a-z]\d{5,}/i.test(path)) return true;
  if (/\d{5,}/.test(path)) return true;
  return false;
}

function extractLinks(html: string, baseUrl: string): Link[] {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "");

  const links: Link[] = [];
  const seen = new Set<string>();
  const linkRe = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRe.exec(stripped)) !== null) {
    const text = stripHtml(match[2]);
    if (text.length < 8 || text.length > 100) continue;
    if (!hasChinese(text)) continue;
    if (NON_NEWS_RE.test(text)) continue;
    const href = resolveUrl(match[1], baseUrl);
    if (!href || !/^https?:\/\//.test(href) || href === baseUrl) continue;
    if (seen.has(href)) continue;
    seen.add(href);
    links.push({ text, href });
    if (links.length >= 30) break;
  }

  // Sort: article-like URLs first
  links.sort((a, b) => {
    const aArt = looksLikeArticle(a.href, baseUrl) ? 0 : 1;
    const bArt = looksLikeArticle(b.href, baseUrl) ? 0 : 1;
    return aArt - bArt;
  });

  return links;
}

function extractArticleText(html: string): string {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "");

  // Try to find article/main content
  const articleMatch = stripped.match(/(?:<article[^>]*>|<main[^>]*>|<div[^>]*class="[^"]*(?:article|content|post|entry)[^"]*"[^>]*>)([\s\S]*?)(?:<\/article>|<\/main>|<\/div>)/i);
  const body = articleMatch ? articleMatch[1] : stripped;
  return stripHtml(body).slice(0, ARTICLE_TRUNCATE);
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const cnNewsTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "cnNews",
      description:
        "Fetch news from 23 major Chinese news sites. Gets homepage headlines + follows top article sub-links to extract content summaries. No API key needed.",
      parameters: {
        type: "object",
        properties: {
          tier: {
            type: "integer",
            description: "Filter by tier: 1 for top 10 sites, 2 for additional 13 sites. Omit for all 23.",
          },
          maxArticles: {
            type: "integer",
            description: "Max article sub-links to follow per site (default 3, max 5).",
          },
        },
      },
    },
  },

  execute: async (args: Record<string, unknown>) => {
    const tier = args.tier ? Number(args.tier) : 0;
    const maxArticles = Math.min(Number(args.maxArticles) || MAX_ARTICLES_PER_SITE, 5);
    const sites = tier ? SITES.filter((s) => s.tier === tier) : SITES;

    const results: Array<{
      site: string; url: string; tier: number;
      headlines: string[]; articles: Array<{ title: string; url: string; summary: string }>;
      error?: string;
    }> = [];

    for (let i = 0; i < sites.length; i += CONCURRENCY) {
      const batch = sites.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map(async (site) => {
          try {
            const html = await fetchPage(site.url);
            const links = extractLinks(html, site.url);

            // Headlines from top links
            const headlines = links.slice(0, 20).map((l) => l.text);

            // Follow sub-links for article content (parallel within site)
            const toFetch = links.slice(0, maxArticles);
            const articles = await Promise.all(
              toFetch.map(async (link) => {
                try {
                  const articleHtml = await fetchPage(link.href);
                  return { title: link.text, url: link.href, summary: extractArticleText(articleHtml) };
                } catch {
                  return { title: link.text, url: link.href, summary: "(fetch failed)" };
                }
              }),
            );

            return { site: site.name, url: site.url, tier: site.tier, headlines, articles };
          } catch (e: any) {
            return { site: site.name, url: site.url, tier: site.tier, headlines: [], articles: [], error: e.message };
          }
        }),
      );
      results.push(...batchResults);
      if (i + CONCURRENCY < sites.length) await delay(500);
    }

    // Group by tier
    const byTier: Record<number, typeof results> = {};
    for (const r of results) {
      if (!byTier[r.tier]) byTier[r.tier] = [];
      byTier[r.tier].push(r);
    }

    const totalArticles = results.reduce((s, r) => s + r.articles.length, 0);
    let output = `Total sites: ${results.length}, headlines: ${results.reduce((s, r) => s + r.headlines.length, 0)}, articles followed: ${totalArticles}\n\n`;

    for (const t of [1, 2]) {
      if (!byTier[t]) continue;
      output += `== Tier ${t} ==\n`;
      for (const r of byTier[t]) {
        if (r.error) {
          output += `${r.site}: ERROR - ${r.error}\n`;
          continue;
        }
        output += `\n${r.site}:\n`;
        for (const h of r.headlines) {
          output += `  - ${h}\n`;
        }
        if (r.articles.length > 0) {
          output += `  [Article summaries]:\n`;
          for (const a of r.articles) {
            output += `    * ${a.title}\n      ${a.summary}\n`;
          }
        }
      }
      output += "\n";
    }

    return output;
  },
};
