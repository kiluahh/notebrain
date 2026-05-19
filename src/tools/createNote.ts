import type { App } from "obsidian";
import type { RegisteredTool } from "./registry";

let vaultApp: App | null = null;
export function setCreateNoteApp(app: App) {
  vaultApp = app;
}

let yamlEnabled = true;
let noteTemplate = "";

export function setCreateNoteConfig(cfg: { yamlEnabled: boolean; noteTemplate: string }) {
  yamlEnabled = cfg.yamlEnabled;
  noteTemplate = cfg.noteTemplate;
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---[\s\S]*?---\n*/, "");
}

export const createNoteTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "createNote",
      description:
        "Create a new markdown note in the vault. Specify file name (without .md), optional folder path, and markdown content. Returns the path of the created note.",
      parameters: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "Note name without extension, e.g. 'Meeting Notes', 'Project Plan'. Required.",
          },
          folder: {
            type: "string",
            description: "Folder path relative to vault root, e.g. 'Projects', 'Daily/2025'. Created if it doesn't exist. Omit for vault root.",
          },
          content: {
            type: "string",
            description: "Markdown content for the note. Supports full markdown: headings, wikilinks, frontmatter, etc. Omit to create an empty note.",
          },
        },
        required: ["file"],
      },
    },
  },

  execute: async (args: Record<string, unknown>) => {
    if (!vaultApp) return JSON.stringify({ error: "Vault not available" });

    const fileName = args.file as string;
    const folder = args.folder as string | undefined;
    const rawContent = (args.content as string) || "";

    if (!fileName || !fileName.trim()) {
      return JSON.stringify({ error: "file name is required" });
    }

    const cleanName = fileName.replace(/\.md$/, "").trim();
    const disallowed = /[\\/:*?"<>|#^\[\]]/;
    if (disallowed.test(cleanName)) {
      return JSON.stringify({ error: `Invalid file name: ${cleanName}. Avoid characters: \\ / : * ? " < > | # ^ [ ]` });
    }

    const folderPath = folder?.replace(/^\/+|\/+$/g, "").trim();

    try {
      // Ensure folder exists
      if (folderPath) {
        const parts = folderPath.split("/");
        let currentPath = "";
        const adapter = vaultApp.vault.adapter;
        for (const part of parts) {
          currentPath += (currentPath ? "/" : "") + part;
          if (!(await adapter.exists(currentPath))) {
            await vaultApp.vault.createFolder(currentPath);
          }
        }
      }

      const notePath = folderPath ? `${folderPath}/${cleanName}.md` : `${cleanName}.md`;

      // Check if already exists
      const existing = vaultApp.vault.getAbstractFileByPath(notePath);
      if (existing) {
        return JSON.stringify({ error: `Note already exists: ${notePath}` });
      }

      // Build final content: template + user content
      let finalContent = rawContent;

      // Prepend template if configured. Always strip AI's YAML + H1 —
      // template injection is the single source of truth for the header.
      if (noteTemplate) {
        const tf = vaultApp.vault.getAbstractFileByPath(noteTemplate);
        if (tf && (tf as any).extension === "md") {
          const templateContent = await vaultApp.vault.read(tf as any);
          // Always strip AI's YAML frontmatter and leading H1
          finalContent = stripFrontmatter(finalContent.trimStart());
          finalContent = finalContent.replace(/^#\s[^\n]+\n?/, "").trimStart();
          if (!yamlEnabled) {
            finalContent = stripFrontmatter(templateContent) + finalContent;
          } else {
            finalContent = templateContent + finalContent;
          }
        }
      }

      // Strip frontmatter if disabled (also catches AI adding its own frontmatter)
      if (!yamlEnabled) {
        finalContent = stripFrontmatter(finalContent);
      }

      await vaultApp.vault.create(notePath, finalContent);

      return JSON.stringify({
        success: true,
        path: notePath,
        file: cleanName,
        folder: folderPath || "/",
        size: finalContent.length,
      });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "Create failed" });
    }
  },
};
