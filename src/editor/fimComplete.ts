import { Editor, Notice } from "obsidian";
import { DeepSeekFimClient } from "../api/deepseekFim";
import type NotebrainPlugin from "../../main";

/** Find the +++ or +++N marker near the cursor. Returns { prefix, suffix, maxTokens, markerStart, markerEnd }. */
function findMarker(
  content: string,
  cursorOffset: number,
): { prefix: string; suffix: string; maxTokens: number; markerStart: number; markerEnd: number } | null {
  // Look for a +++ line: /^\+{3}(\d*)$/ — the cursor should be on or near this line
  const lines = content.split("\n");
  let lineStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineEnd = lineStart + lines[i].length;
    const match = lines[i].match(/^\++(\d*)$/);
    if (match && lines[i].startsWith("+++")) {
      const markerStart = lineStart;
      const markerEnd = lineEnd + 1; // include the \n
      // Cursor should be within or near the marker line
      if (cursorOffset >= markerStart && cursorOffset <= markerEnd + 1) {
        const prefix = content.slice(0, markerStart).trimEnd();
        const suffix = content.slice(markerEnd).trimStart();
        const maxTokens = match[1] ? parseInt(match[1], 10) : 0;
        return { prefix, suffix, maxTokens, markerStart, markerEnd };
      }
    }
    lineStart = lineEnd + 1; // +1 for \n
  }
  return null;
}

export async function runFimComplete(plugin: NotebrainPlugin, editor: Editor) {
  const doc = editor.getDoc();
  const content = doc.getValue();
  const cursorOffset = doc.posToOffset(editor.getCursor());

  const s = plugin.settings;
  if (!s.fimApiKey && !s.apiKey) {
    new Notice("Notebrain FIM: API key not configured.");
    return;
  }

  const marker = findMarker(content, cursorOffset);
  if (!marker) {
    new Notice("Notebrain FIM: Place cursor on a +++ line (or +++512 for custom max tokens).");
    return;
  }

  const fimClient = new DeepSeekFimClient({
    apiKey: s.fimApiKey || s.apiKey,
    baseUrl: s.fimBaseUrl || "https://api.deepseek.com",
    model: s.fimModel || s.model,
  });

  const maxTokens = marker.maxTokens || s.fimMaxTokens;
  const temperature = s.fimTemperature;

  new Notice("Notebrain FIM: Completing...");
  const result = await fimClient.complete(
    marker.prefix,
    marker.suffix || undefined,
    maxTokens,
    temperature,
  );

  // Replace the +++ marker with the result
  const from = editor.offsetToPos(marker.markerStart);
  const to = editor.offsetToPos(marker.markerEnd);
  editor.replaceRange(result + "\n", from, to);
}
