import type { App, TFile } from "obsidian";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface ChatMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: string;
  context?: string;
  reasoningContent?: string;
  toolCalls?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export class ChatPersistence {
  private app: App;
  private folderPath: string;

  constructor(app: App, folderPath: string) {
    this.app = app;
    this.folderPath = folderPath;
  }

  private getFullPath(sessionId: string): string {
    return `${this.folderPath}/${sessionId}.md`;
  }

  async ensureFolder(): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(this.folderPath);
    if (!folder) {
      await this.app.vault.createFolder(this.folderPath);
    }
  }

  formatTimestamp(date: Date = new Date()): string {
    return date.toISOString().replace("T", " ").slice(0, 19);
  }

  serializeMessages(messages: ChatMessage[]): string {
    return messages
      .map((msg) => {
        const lines: string[] = [];
        const role = msg.role === "assistant" ? "ai" : msg.role;
        const header = `**${role}**: ${msg.content}`;
        lines.push(header);

        if (msg.context) {
          lines.push(`[Context: ${msg.context}]`);
        }
        if (msg.reasoningContent) {
          lines.push(`[Reasoning: ${msg.reasoningContent}]`);
        }
        if (msg.toolCalls) {
          lines.push(`[Tool Calls: ${msg.toolCalls}]`);
        }
        lines.push(`[Timestamp: ${msg.timestamp}]`);
        lines.push("");
        return lines.join("\n");
      })
      .join("");
  }

  parseMessages(content: string): ChatMessage[] {
    const messages: ChatMessage[] = [];
    const blocks = content.split(/\n(?=\*\*)/);

    for (const block of blocks) {
      if (!block.trim()) continue;

      const roleMatch = block.match(/^\*\*(user|ai|system|tool)\*\*:\s*([\s\S]*?)(?:\n\[|$)/);
      if (!roleMatch) continue;

      const role = roleMatch[1] === "ai" ? "assistant" : roleMatch[1] as ChatMessage["role"];
      const contentText = roleMatch[2].trim();

      const contextMatch = block.match(/\[Context:\s*([^\]]+)\]/);
      const timestampMatch = block.match(/\[Timestamp:\s*([^\]]+)\]/);
      const reasoningMatch = block.match(/\[Reasoning:\s*([\s\S]*?)\]/);
      const toolCallsMatch = block.match(/\[Tool Calls:\s*([\s\S]*?)\]/);

      messages.push({
        role,
        content: contentText,
        timestamp: timestampMatch?.[1] ?? "",
        context: contextMatch?.[1],
        reasoningContent: reasoningMatch?.[1],
        toolCalls: toolCallsMatch?.[1],
      });
    }

    return messages;
  }

  async saveSession(session: ChatSession): Promise<void> {
    await this.ensureFolder();
    const path = this.getFullPath(session.id);
    const existing = this.app.vault.getAbstractFileByPath(path) as TFile | null;

    const md = this.serializeMessages(session.messages);

    if (existing) {
      await this.app.vault.modify(existing, md);
    } else {
      await this.app.vault.create(path, md);
    }
  }

  async loadSession(sessionId: string): Promise<ChatSession | null> {
    const path = this.getFullPath(sessionId);
    const file = this.app.vault.getAbstractFileByPath(path) as TFile | null;
    if (!file) return null;

    const content = await this.app.vault.read(file);
    const messages = this.parseMessages(content);

    return {
      id: sessionId,
      title: messages[0]?.content.slice(0, 50) ?? "Untitled",
      messages,
      createdAt: messages[0]?.timestamp ?? "",
      updatedAt: messages[messages.length - 1]?.timestamp ?? "",
    };
  }

  async listSessions(): Promise<Array<{ id: string; title: string; updatedAt: string }>> {
    await this.ensureFolder();
    const folder = this.app.vault.getAbstractFileByPath(this.folderPath);
    if (!folder) return [];

    const files = this.app.vault.getMarkdownFiles().filter((f) =>
      f.path.startsWith(this.folderPath + "/")
    );

    return files.map((f) => {
      const id = f.name.replace(/\.md$/, "");
      return {
        id,
        title: id,
        updatedAt: "",
      };
    });
  }

  sessionToApiMessages(session: ChatSession): Array<ChatCompletionMessageParam> {
    const apiMessages: Array<ChatCompletionMessageParam> = [];

    for (const msg of session.messages) {
      if (msg.role === "tool") {
        apiMessages.push({
          role: "tool",
          tool_call_id: (msg as any).toolCallId ?? "",
          content: msg.content,
        });
      } else {
        apiMessages.push({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        });
      }
    }

    return apiMessages;
  }
}
