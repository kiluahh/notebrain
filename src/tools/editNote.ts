import type { App, TFile } from "obsidian";
import type { RegisteredTool } from "./registry";

let vaultApp: App | null = null;
export function setEditNoteApp(app: App) {
  vaultApp = app;
}

let permissionTag = "#notebrain";
export function setEditNoteConfig(cfg: { permissionTag: string }) {
  permissionTag = cfg.permissionTag || "#notebrain";
}

function hasPermissionTag(file: TFile): boolean {
  if (!vaultApp) return false;
  const cache = vaultApp.metadataCache.getFileCache(file);
  const inlineTags = (cache?.tags || []).map((t: any) => t.tag);
  const fmTags: string[] = (cache?.frontmatter?.tags as any[])?.map((t: any) => String(t)) || [];
  const allTags = [...inlineTags, ...fmTags];
  const barePermission = permissionTag.replace(/^#/, "");
  return allTags.some((t) => t === permissionTag || t === barePermission || t === `#${barePermission}`);
}

function resolveFile(args: Record<string, unknown>): TFile | null {
  if (!vaultApp) return null;

  const fileName = args.file as string | undefined;
  const filePath = args.path as string | undefined;

  if (filePath) {
    const f = vaultApp.vault.getAbstractFileByPath(filePath);
    if (f && (f as any).extension === "md") return f as TFile;
  }

  if (fileName) {
    const clean = fileName.replace(/\.md$/, "");
    const all = vaultApp.vault.getMarkdownFiles();
    const matches = all.filter((f) => f.basename === clean);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) return null;
  }

  return null;
}

export const editNoteTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "editNote",
      description:
        "Edit an existing note. Supports replace (find/replace text), append (add to end), and prepend (add to start). The note must have the configured permission tag.",
      parameters: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "Note name without extension, e.g. 'My Note'. Use with path if ambiguous.",
          },
          path: {
            type: "string",
            description: "Vault-relative path, e.g. 'folder/note.md'. More precise than file.",
          },
          mode: {
            type: "string",
            enum: ["replace", "append", "prepend"],
            description: "Edit mode: 'replace' finds and replaces text, 'append' adds to end, 'prepend' adds to start.",
          },
          search: {
            type: "string",
            description: "Text to find (for replace mode). Must match exactly once in the note.",
          },
          replace: {
            type: "string",
            description: "Replacement text (for replace mode). Use an empty string to delete the matched text.",
          },
          content: {
            type: "string",
            description: "Content to add (for append/prepend mode). Added with a newline separator.",
          },
        },
        required: ["mode"],
      },
    },
  },

  execute: async (args: Record<string, unknown>) => {
    if (!vaultApp) return JSON.stringify({ error: "Vault not available" });

    const mode = args.mode as string;
    const search = args.search as string | undefined;
    const replace = args.replace as string | undefined;
    const content = args.content as string | undefined;

    const file = resolveFile(args);
    if (!file) return JSON.stringify({ error: "Note not found. Provide a valid file name or path." });

    // Permission check
    if (!hasPermissionTag(file)) {
      return JSON.stringify({
        error: `Permission denied. This note does not have the required tag "${permissionTag}". Add "${permissionTag}" to the note body or frontmatter tags to grant edit access.`,
      });
    }

    try {
      if (mode === "replace") {
        if (search === undefined) {
          return JSON.stringify({ error: "search is required for replace mode" });
        }

        const result = await vaultApp.vault.process(file, (current) => {
          const idx = current.indexOf(search);
          if (idx === -1) return current;
          // Ensure unique match
          const secondIdx = current.indexOf(search, idx + 1);
          if (secondIdx !== -1) {
            return current; // ambiguous, return unchanged — caller should be more specific
          }
          return current.slice(0, idx) + (replace ?? "") + current.slice(idx + search.length);
        });

        // Check if replacement happened
        const replaced = !result.includes(search);
        return JSON.stringify({
          success: replaced,
          path: file.path,
          file: file.basename,
          mode: "replace",
          replaced,
          message: replaced ? "Text replaced." : "Search text not found or not unique. Try a more specific search string.",
        });
      }

      if (mode === "append") {
        if (!content) return JSON.stringify({ error: "content is required for append mode" });

        await vaultApp.vault.process(file, (current) => {
          const trimmed = current.trimEnd();
          return trimmed + "\n\n" + content + "\n";
        });

        return JSON.stringify({
          success: true,
          path: file.path,
          file: file.basename,
          mode: "append",
        });
      }

      if (mode === "prepend") {
        if (!content) return JSON.stringify({ error: "content is required for prepend mode" });

        await vaultApp.vault.process(file, (current) => {
          const trimmed = current.trimStart();
          return content + "\n\n" + trimmed;
        });

        return JSON.stringify({
          success: true,
          path: file.path,
          file: file.basename,
          mode: "prepend",
        });
      }

      return JSON.stringify({ error: `Unknown mode: ${mode}` });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "Edit failed" });
    }
  },
};
