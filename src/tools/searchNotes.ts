import type { App } from "obsidian";
import type { RegisteredTool } from "./registry";

let vaultApp: App | null = null;
export function setSearchNotesApp(app: App) {
  vaultApp = app;
}

export const searchNotesTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "searchNotes",
      description:
        "Search notes in the Obsidian vault. Supports keyword, tag, filename, path, property, regex, and full-text search. Use operators: OR, -exclude, \"exact phrase\".",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Search query. Supports: keywords (AND by default, OR for any), -word to exclude, \"exact phrase\", /regex/. Omit to list files without filtering.",
          },
          searchIn: {
            type: "string",
            enum: ["content", "filename", "path", "tag", "property", "all"],
            description: "Where to search: 'content' (default), 'filename', 'path', 'tag' (prefix with #), 'property' (use with propertyName), or 'all'.",
          },
          propertyName: {
            type: "string",
            description: "Property name to search. Use with searchIn=property. Example: 'status' searches [status:...]. Omit to find files that have this property at all.",
          },
          propertyValue: {
            type: "string",
            description: "Property value to match. Use with propertyName. Supports exact match, 'null' for empty, or /regex/. Example: 'Draft' or '/2024/'.",
          },
          caseSensitive: {
            type: "boolean",
            description: "Case sensitive search (default: false).",
          },
          maxResults: {
            type: "integer",
            description: "Max results to return (default: 15).",
          },
        },
      },
    },
  },

  execute: async (args: Record<string, unknown>) => {
    if (!vaultApp) return JSON.stringify({ error: "Vault not available" });

    const query = (args.query as string) || "";
    const searchIn = (args.searchIn as string) || "content";
    const propertyName = args.propertyName as string | undefined;
    const propertyValue = args.propertyValue as string | undefined;
    const caseSensitive = !!(args.caseSensitive);
    const maxResults = Math.min(Math.max(Number(args.maxResults) || 15, 1), 100);

    const files = vaultApp.vault.getMarkdownFiles();

    // Empty query and no property filter: list all notes
    let results: SearchResult[] = [];
    if (!query && !propertyName) {
      results = listAllNotes(files);
    } else if (searchIn === "tag") {
      results = searchTags(files, query, caseSensitive);
    } else if (searchIn === "property" || propertyName) {
      results = searchProperties(files, propertyName || query, propertyValue, caseSensitive);
    } else if (searchIn === "filename") {
      results = searchFilename(files, query, caseSensitive);
    } else if (searchIn === "path") {
      results = searchPath(files, query, caseSensitive);
    } else {
      results = await searchContent(files, query, caseSensitive);
    }

    // further filter by property in 'all' mode
    if (searchIn === "all" && propertyName && query) {
      results = filterByProperty(results, propertyName, propertyValue, caseSensitive);
    }

    return JSON.stringify({
      query: query || "(all notes)",
      total: results.length,
      results: results.slice(0, maxResults),
    });
  },
};

interface SearchResult {
  file: string;
  path: string;
  snippet: string;
  tags: string[];
  properties: Record<string, unknown>;
}

function listAllNotes(
  files: Array<{ path: string; basename: string }>,
): SearchResult[] {
  return files.map((f) => {
    const cache = vaultApp!.metadataCache.getFileCache(f as any);
    return {
      file: f.basename,
      path: f.path,
      snippet: f.path,
      tags: (cache?.tags || []).map((t: any) => t.tag),
      properties: cache?.frontmatter || {},
    };
  });
}

function searchTags(
  files: Array<{ path: string; basename: string }>,
  query: string,
  caseSensitive: boolean,
): SearchResult[] {
  const results: SearchResult[] = [];
  const cleanQuery = query.replace(/^#/, "");

  for (const f of files) {
    const cache = vaultApp!.metadataCache.getFileCache(f as any);
    // merge inline #tags and frontmatter tags: property
    const inlineTags = (cache?.tags || []).map((t: any) => t.tag);
    const fmTags: string[] = (cache?.frontmatter?.tags as any[])?.map((t: any) => String(t)) || [];
    const allTags = [...new Set([...inlineTags, ...fmTags])];

    if (allTags.length === 0) continue;

    const matched = allTags.some((t) => {
      const tagName = t.replace(/^#/, "");
      return caseSensitive ? tagName.includes(cleanQuery) : tagName.toLowerCase().includes(cleanQuery.toLowerCase());
    });
    if (!matched && cleanQuery) continue;

    results.push({
      file: f.basename,
      path: f.path,
      snippet: allTags.join(", "),
      tags: allTags,
      properties: cache?.frontmatter || {},
    });
  }
  return results;
}

function searchProperties(
  files: Array<{ path: string; basename: string }>,
  name: string,
  value: string | undefined,
  caseSensitive: boolean,
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const f of files) {
    const cache = vaultApp!.metadataCache.getFileCache(f as any);
    const fm = cache?.frontmatter || {};
    if (!(name in fm)) continue;

    if (value !== undefined && value !== "") {
      if (!matchPropertyVal(fm[name], value, caseSensitive)) continue;
    }

    results.push({
      file: f.basename,
      path: f.path,
      snippet: `[${name}: ${JSON.stringify(fm[name])}]`,
      tags: (cache?.tags || []).map((t: any) => t.tag),
      properties: fm,
    });
  }
  return results;
}

function searchFilename(
  files: Array<{ path: string; basename: string }>,
  query: string,
  caseSensitive: boolean,
): SearchResult[] {
  const results: SearchResult[] = [];
  for (const f of files) {
    const target = caseSensitive ? f.basename : f.basename.toLowerCase();
    const q = caseSensitive ? query : query.toLowerCase();
    if (query && !target.includes(q)) continue;

    const cache = vaultApp!.metadataCache.getFileCache(f as any);
    results.push({
      file: f.basename,
      path: f.path,
      snippet: f.path,
      tags: (cache?.tags || []).map((t: any) => t.tag),
      properties: cache?.frontmatter || {},
    });
  }
  return results;
}

function searchPath(
  files: Array<{ path: string; basename: string }>,
  query: string,
  caseSensitive: boolean,
): SearchResult[] {
  const results: SearchResult[] = [];
  for (const f of files) {
    const target = caseSensitive ? f.path : f.path.toLowerCase();
    const q = caseSensitive ? query : query.toLowerCase();
    if (query && !target.includes(q)) continue;

    const cache = vaultApp!.metadataCache.getFileCache(f as any);
    results.push({
      file: f.basename,
      path: f.path,
      snippet: f.path,
      tags: (cache?.tags || []).map((t: any) => t.tag),
      properties: cache?.frontmatter || {},
    });
  }
  return results;
}

async function searchContent(
  files: Array<{ path: string; basename: string }>,
  query: string,
  caseSensitive: boolean,
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  // Empty query: return all notes
  if (!query) {
    for (const f of files) {
      const cache = vaultApp!.metadataCache.getFileCache(f as any);
      results.push({
        file: f.basename,
        path: f.path,
        snippet: f.path,
        tags: (cache?.tags || []).map((t: any) => t.tag),
        properties: cache?.frontmatter || {},
      });
    }
    return results;
  }

  // Parse query: split by OR into groups, each group uses AND internally
  const groups = parseQuery(query, caseSensitive);

  for (const f of files) {
    const cache = vaultApp!.metadataCache.getFileCache(f as any);
    const inlineTags = (cache?.tags || []).map((t: any) => t.tag);
    const properties = cache?.frontmatter || {};

    // No text filter: match all
    const hasFilter = groups.length > 0 && groups.some((g) => g.include.length > 0 || g.exclude.length > 0 || g.regex || g.phrase || g.tags.length > 0 || g.properties.length > 0);
    if (!hasFilter) {
      results.push({ file: f.basename, path: f.path, snippet: f.path, tags: inlineTags, properties });
      continue;
    }

    // Check if file matches ANY OR-group
    for (const terms of groups) {
      // tag filter
      if (terms.tags.length > 0) {
        const fileTags = inlineTags.map((t) => t.replace(/^#/, ""));
        const allTagMatch = terms.tags.every((t) =>
          fileTags.some((ft) => (caseSensitive ? ft.includes(t) : ft.toLowerCase().includes(t.toLowerCase()))),
        );
        if (!allTagMatch) continue; // try next group
      }

      // property filter
      if (terms.properties.length > 0) {
        const allPropMatch = terms.properties.every(([k, v]) => {
          if (!(k in properties)) return false;
          return matchPropertyVal(properties[k], v || "", caseSensitive);
        });
        if (!allPropMatch) continue;
      }

      // text filter: read file content
      if (terms.include.length > 0 || terms.exclude.length > 0 || terms.regex || terms.phrase) {
        const content = await vaultApp!.vault.read(f as any);
        let text = caseSensitive ? content : content.toLowerCase();

        if (terms.exclude.length > 0 && terms.exclude.some((w) => text.includes(w))) continue;
        if (terms.include.length > 0 && !terms.include.every((w) => text.includes(w))) continue;
        if (terms.phrase && !text.includes(terms.phrase)) continue;
        if (terms.regex) {
          try {
            if (!new RegExp(terms.regex.pattern, terms.regex.flags + (caseSensitive ? "" : "i")).test(content)) continue;
          } catch { continue; }
        }

        const snippet = extractSnippet(content, terms.include[0] || terms.phrase || terms.regex?.pattern || "", 200);
        results.push({ file: f.basename, path: f.path, snippet, tags: inlineTags, properties });
      } else {
        // matched on tags/properties only, no text filter needed
        results.push({ file: f.basename, path: f.path, snippet: f.path, tags: inlineTags, properties });
      }
      break; // matched this group, don't check remaining groups
    }
  }

  return results;
}

interface ParsedTerms {
  include: string[];
  exclude: string[];
  phrase: string | null;
  tags: string[];
  properties: Array<[string, string | null]>;
  regex: { pattern: string; flags: string } | null;
}

function parseQuery(raw: string, caseSensitive: boolean): ParsedTerms[] {
  // Split into OR groups (case-insensitive)
  const groupStrings = raw.split(/\s+OR\s+/i).map((g) => g.trim()).filter((g) => g);
  if (groupStrings.length === 0) return [];
  return groupStrings.map((g) => parseSingleGroup(g, caseSensitive));
}

function parseSingleGroup(raw: string, caseSensitive: boolean): ParsedTerms {
  const include: string[] = [];
  const exclude: string[] = [];
  const tags: string[] = [];
  const properties: Array<[string, string | null]> = [];
  let phrase: string | null = null;
  let regex: { pattern: string; flags: string } | null = null;

  // Extract regex: /pattern/flags
  const regexMatch = raw.match(/^\/(.+?)\/([a-z]*)$/);
  if (regexMatch) {
    return { include, exclude, phrase, tags, properties, regex: { pattern: regexMatch[1], flags: regexMatch[2] } };
  }

  // Extract exact phrase: "..."
  const phraseMatches = raw.match(/"([^"]+)"/g);
  if (phraseMatches) {
    phrase = phraseMatches.map((m) => m.slice(1, -1)).join(" ");
    raw = raw.replace(/"([^"]+)"/g, "");
  }

  const tokens = raw.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

  for (const token of tokens) {
    const t = caseSensitive ? token : token.toLowerCase();

    if (t.startsWith("-") && t.length > 1) {
      exclude.push(t.slice(1));
    } else if (t.startsWith("#")) {
      tags.push(t.slice(1));
    } else if (t.match(/^\[(.+?)(?::(.+?))?\]$/)) {
      const pm = t.match(/^\[(.+?)(?::(.+?))?\]$/);
      if (pm) properties.push([pm[1], pm[2] || null]);
    } else {
      include.push(t);
    }
  }

  return { include, exclude, phrase, tags, properties, regex };
}

function extractSnippet(content: string, query: string, maxLen: number): string {
  if (!query) return content.slice(0, maxLen);
  const idx = content.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return content.slice(0, maxLen);
  const start = Math.max(0, idx - 60);
  const end = Math.min(content.length, idx + query.length + 60);
  let snip = content.slice(start, end);
  if (start > 0) snip = "..." + snip;
  if (end < content.length) snip += "...";
  return snip;
}

function matchPropertyVal(propVal: unknown, searchVal: string, caseSensitive: boolean): boolean {
  const pv = String(propVal ?? "");
  if (searchVal === "null") return !propVal;
  // regex: /pattern/flags
  const reMatch = searchVal.match(/^\/(.+?)\/([a-z]*)$/);
  if (reMatch) {
    try {
      return new RegExp(reMatch[1], reMatch[2] + (caseSensitive ? "" : "i")).test(pv);
    } catch { return false; }
  }
  // substring
  const a = caseSensitive ? pv : pv.toLowerCase();
  const b = caseSensitive ? searchVal : searchVal.toLowerCase();
  return a.includes(b);
}

function filterByProperty(
  results: SearchResult[],
  name: string,
  value: string | undefined,
  caseSensitive: boolean,
): SearchResult[] {
  return results.filter((r) => {
    if (!(name in r.properties)) return false;
    if (value === undefined || value === "") return true;
    return matchPropertyVal(r.properties[name], value, caseSensitive);
  });
}
