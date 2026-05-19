import type { ToolDefinition } from "../api/deepseek";
import { getCurrentTimeTool } from "./getCurrentTime";
import { searchNotesTool } from "./searchNotes";
import { tavilySearchTool } from "./tavilySearch";
import { tavilyExtractTool } from "./tavilyExtract";
import { tavilyMapTool } from "./tavilyMap";
import { tavilyCrawlTool } from "./tavilyCrawl";
import { tavilyResearchTool } from "./tavilyResearch";
import { tavilyResearchGetTool } from "./tavilyResearchGet";
import { webFetchTool } from "./webFetch";
import { githubSearchTool } from "./githubSearch";
import { arxivSearchTool } from "./arxivSearch";
import { arxivDownloadTool } from "./arxivDownload";
import { baiduBaikeTool } from "./baiduBaike";
import { wikipediaTool } from "./wikipedia";
import { readNoteTool } from "./readNote";
import { webSearchTool } from "./webSearch";
import { createNoteTool } from "./createNote";
import { editNoteTool } from "./editNote";
import { getBacklinksTool } from "./getBacklinks";
import { listFolderTool } from "./listFolder";
import { cnNewsTool } from "./cnNews";

export interface RegisteredTool {
  definition: ToolDefinition;
  execute: (args: Record<string, unknown>, apiKeys?: Record<string, string>) => Promise<string> | string;
}

const toolRegistry = new Map<string, RegisteredTool>();

// API keys are stored here and passed to tools on execution
let toolApiKeys: Record<string, string> = {};

// Tools disabled by user in settings
let disabledTools: Set<string> = new Set();

export function setToolApiKeys(keys: Record<string, string>) {
  toolApiKeys = keys;
}

export function setDisabledTools(tools: string[]) {
  disabledTools = new Set(tools);
}

export function registerTool(name: string, tool: RegisteredTool) {
  toolRegistry.set(name, tool);
}

export function getTool(name: string): RegisteredTool | undefined {
  if (disabledTools.has(name)) return undefined;
  return toolRegistry.get(name);
}

export function getToolDefinitions(): ToolDefinition[] {
  return Array.from(toolRegistry.entries())
    .filter(([name]) => !disabledTools.has(name))
    .map(([, t]) => t.definition);
}

export function getAllTools(): Map<string, RegisteredTool> {
  const result = new Map<string, RegisteredTool>();
  for (const [name, tool] of toolRegistry) {
    if (!disabledTools.has(name)) result.set(name, tool);
  }
  return result;
}

export function registerAllBuiltinTools() {
  registerTool("getCurrentTime", getCurrentTimeTool);
  registerTool("searchNotes", searchNotesTool);
  registerTool("tavilySearch", tavilySearchTool);
  registerTool("tavilyExtract", tavilyExtractTool);
  registerTool("tavilyMap", tavilyMapTool);
  registerTool("tavilyCrawl", tavilyCrawlTool);
  registerTool("tavilyResearch", tavilyResearchTool);
  registerTool("tavilyResearchGet", tavilyResearchGetTool);
  registerTool("webFetch", webFetchTool);
  registerTool("githubSearch", githubSearchTool);
  registerTool("arxivSearch", arxivSearchTool);
  registerTool("arxivDownload", arxivDownloadTool);
  registerTool("baiduBaike", baiduBaikeTool);
  registerTool("wikipedia", wikipediaTool);
  registerTool("readNote", readNoteTool);
  registerTool("createNote", createNoteTool);
  registerTool("editNote", editNoteTool);
  registerTool("getBacklinks", getBacklinksTool);
  registerTool("listFolder", listFolderTool);
  registerTool("webSearch", webSearchTool);
  registerTool("cnNews", cnNewsTool);
}

export { toolApiKeys };
