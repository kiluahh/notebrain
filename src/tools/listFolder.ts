import type { App } from "obsidian";
import type { RegisteredTool } from "./registry";

let vaultApp: App | null = null;
export function setListFolderApp(app: App) {
  vaultApp = app;
}

export const listFolderTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "listFolder",
      description:
        "List the contents of a vault folder. Shows markdown files, other files, and subfolders. Use this to browse vault structure or explore a directory. Omit path for vault root.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Folder path relative to vault root. Omit or use '/' for root. e.g. 'Daily', 'Projects/Active'.",
          },
        },
      },
    },
  },

  execute: async (args: Record<string, unknown>) => {
    if (!vaultApp) return JSON.stringify({ error: "Vault not available" });

    let folderPath = (args.path as string) || "";
    folderPath = folderPath.replace(/^\/+|\/+$/g, "").trim();

    try {
      const adapter = vaultApp.vault.adapter;
      const listPath = folderPath || "/";
      const exists = await adapter.exists(listPath);
      if (!exists) return JSON.stringify({ error: `Folder not found: ${folderPath || "/"}` });

      const list = await adapter.list(listPath);

      const mdFiles: string[] = [];
      const otherFiles: string[] = [];
      const folders: string[] = [];

      for (const f of list.files) {
        if (f.endsWith(".md")) mdFiles.push(f);
        else otherFiles.push(f);
      }
      for (const d of list.folders) {
        if (!d.startsWith(".")) folders.push(d);
      }

      return JSON.stringify({
        path: folderPath || "/",
        markdownFiles: mdFiles,
        otherFiles: otherFiles.length > 0 ? otherFiles : undefined,
        folders,
        totalFiles: list.files.length,
        totalFolders: list.folders.length,
      });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "Failed to list folder" });
    }
  },
};
