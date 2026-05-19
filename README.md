# Notebrain

AI agent inside your Obsidian notes -- chat with DeepSeek directly in any note, with 21 tools for vault search, web research, academic papers, and more.

<!-- screenshot here -->

## Features

- **Chat inside any note** -- Press `Ctrl+Shift+Enter` (macOS: `Cmd+Shift+Enter`) to start a conversation. The AI reads your note context and responds directly in the same file. All conversation history lives in the note itself using `%%` comment markers, so nothing leaves your vault.

- **21 built-in tools** -- The AI can search your vault, read/create/edit notes, browse the web, search academic papers, query Wikipedia, fetch Chinese news, and more. Tools are called automatically when needed.

- **Thinking mode** -- DeepSeek's reasoning/thinking is captured and displayed in collapsible `%%` comment blocks. Reasoning context is preserved across multi-turn conversations for coherent long interactions.

- **Streaming responses** -- Responses stream into the note as they are generated. File writes are batched at configurable intervals (20-500ms) for smooth rendering.

- **FIM completion** -- Fill-in-the-Middle code/text completion via the `+++` marker. Place `+++` on a line where you want content inserted; everything above it is the prefix, everything below is the suffix. Use `+++512` to set a custom max token count.

- **NOTEBRAIN.md** -- A vault-wide AI instruction file, auto-created on first load. Describe your vault structure, note conventions, and preferences. The contents are injected into the AI's system prompt with highest priority.

- **Chat cache** -- 30-minute in-memory cache preserves tool call history and thinking context between messages, so the AI maintains full conversational awareness even when you switch notes and come back.

- **Tool permissions** -- Destructive tools (`createNote`, `editNote`) require user approval via a modal dialog before execution. Notes must carry a configurable permission tag (default `#notebrain`) to be editable.

- **Mobile compatible** -- Works on both desktop and mobile. Uses Obsidian's `requestUrl()` for CSP compliance and vanilla DOM only (no React).

## Quick Start

1. Install the plugin and enable it in Obsidian's Community Plugins settings.
2. Go to **Settings > Notebrain > Model** and enter your **DeepSeek API key** (from [platform.deepseek.com](https://platform.deepseek.com)).
3. Open any note and press **`Ctrl+Shift+Enter`** (or **`Cmd+Shift+Enter`** on macOS).
4. Type your message and watch the AI respond directly in the note.

The first load creates a `NOTEBRAIN.md` file in your vault root. Edit it to tell the AI about your vault structure and preferences.

## How to Use

### Inline Chat

1. Open any markdown note in edit mode.
2. Press **`Ctrl+Shift+Enter`** (or click the brain icon in the ribbon).
3. Type your message at the cursor position.
4. The AI streams its response into the note below your message.

Each conversation turn is structured as:

```
user message

%%
user
[Timestamp: 2026-05-19T10:30:00.000Z]
%%
---
%%thinking content%%
[Tool calls]
searchNotes: {"query":"project notes"}
%%
AI response here...

%%
assistant
[Timestamp: 2026-05-19T10:30:15.000Z]
%%
---
```

Thinking blocks and tool calls live inside `%%...%%` comment pairs (invisible in reading mode). Tool results are passed to the AI but never written to the note. The `#notebrain-session` tag is automatically added to the note's frontmatter after the first chat session.

### FIM Completion

Use Fill-in-the-Middle to generate content between existing text:

```
Chapter 1: The Beginning

It was a dark and stormy night.
+++
Chapter 2: The Return
```

Place the cursor on the `+++` line and trigger FIM from the ribbon icon (pen) or the `Notebrain: FIM Completion` command. The AI fills in the gap and replaces the marker with generated content.

To control output length, append a number to the marker:

```
+++512
```

FIM uses separate API settings (key, base URL, model) configurable in the **FIM** settings tab, so you can use a different model than the chat model.

### NOTEBRAIN.md

The `NOTEBRAIN.md` file is the instruction manual for the AI in your vault. It is auto-created with a template on first load. The AI treats these instructions with highest priority.

Example `NOTEBRAIN.md`:

```markdown
---
tags:
  - notebrain
---

# NOTEBRAIN.md

## Vault Structure
- Daily/ -- daily notes, named YYYY-MM-DD
- Projects/ -- project plans and tracking
- Reference/ -- knowledge base and research

## Note Conventions
- All notes use "date" and "tags" in frontmatter
- Meeting notes start with "Meeting -"
- Use [[wikilinks]] for all internal references

## Preferences
- Language: Chinese
- Response style: Concise
- Never create notes without confirmation
```

The file path is configurable in **Settings > Notebrain > Basic**. The plugin searches for any markdown file named "notebrain" in your vault and loads the first one it finds with the permission tag.

## Settings

<!-- screenshot here -->

### Basic

| Setting | Description | Default |
|---------|-------------|---------|
| Language | UI language (Chinese / English) | `zh` |
| NOTEBRAIN.md path | Path to your vault instruction file | `NOTEBRAIN.md` |
| Write frequency | File write interval in milliseconds during streaming (20-500) | `80` |

### Model

| Setting | Description | Default |
|---------|-------------|---------|
| API key | DeepSeek API key (`sk-...`) | -- |
| Base URL | API endpoint URL | `https://api.deepseek.com` |
| Model | Model name (dynamic list fetched from API) | `deepseek-v4-pro` |
| Thinking mode | Enable DeepSeek reasoning/thinking | On |
| Reasoning effort | Reasoning depth (`high` or `max`) | `high` |
| Temperature | Sampling temperature (0-2, only when thinking is off) | `0.7` |

### Tools

| Setting | Description | Default |
|---------|-------------|---------|
| Tavily API key | For Tavily search/extract/crawl tools (`tvly-...`) | -- |
| GitHub token | For higher GitHub API rate limits (`ghp_...`) | -- |
| Baidu API key | For Baidu Baike encyclopedia (`bce-...`) | -- |
| Headless browser endpoint | Custom endpoint for JS-rendered page fetching | -- |
| Per-tool toggles | Enable/disable individual tools | All on |

### Note

| Setting | Description | Default |
|---------|-------------|---------|
| YAML frontmatter | Whether `createNote` adds YAML frontmatter | On |
| Edit permission tag | Tag required on notes for `editNote` to modify them | `#notebrain` |
| Note template | Template note for `createNote` (select from vault) | -- |

### FIM

FIM (Fill-in-the-Middle) uses separate API credentials from the chat model, so you can use a different provider or model.

| Setting | Description | Default |
|---------|-------------|---------|
| API key | FIM API key (`sk-...`) | -- |
| Base URL | FIM API endpoint | `https://api.deepseek.com` |
| Model | FIM model name | `deepseek-v4-pro` |
| Temperature | Sampling temperature (0-2) | `1.0` |
| Max tokens | Default max output tokens (1-4096) | `1024` |

## Tools Reference

### Vault (6)

| Tool | Description | Requires |
|------|-------------|----------|
| `searchNotes` | Full-text search with keyword, tag, filename, path, property, and regex support. Operators: `OR`, `-exclude`, `"exact phrase"` | -- |
| `readNote` | Read note content by name (wikilink-style) or vault-relative path. Supports offset/limit for large files | -- |
| `listFolder` | List files and folders in a vault directory | -- |
| `getBacklinks` | Get all notes that link to a specific note | -- |
| `createNote` | Create a new note at a specified path. Uses configurable template. Shows approval modal | -- |
| `editNote` | Edit an existing note (append, prepend, replace, or find-replace). Requires permission tag. Shows approval modal | `#notebrain` tag on note |

### Time (1)

| Tool | Description | Requires |
|------|-------------|----------|
| `getCurrentTime` | Get current date/time in multiple formats (ISO, Unix, locale) | -- |

### Web -- Free (3)

| Tool | Description | Requires |
|------|-------------|----------|
| `webSearch` | Free web search using Baidu and Bing simultaneously. Requires 3+ keywords for best results | -- |
| `webFetch` | Fetch and extract clean content from any URL. Uses Jina AI for rendering or optional headless browser endpoint | -- |
| `cnNews` | Fetch headlines and article summaries from 23 major Chinese news sites (Xinhua, People's Daily, CCTV, NetEase, Sina, etc.) | -- |

### Tavily (6)

All Tavily tools require a **Tavily API key** (free tier available at [tavily.com](https://tavily.com)).

| Tool | Description | Requires |
|------|-------------|----------|
| `tavilySearch` | AI-curated web search with titles, URLs, snippets, and relevance scores | Tavily API key |
| `tavilyExtract` | Extract clean markdown/text content from up to 20 URLs. Strips navigation, ads, and clutter | Tavily API key |
| `tavilyCrawl` | Deep crawl starting from a URL with configurable depth and breadth. Good for documentation sites | Tavily API key |
| `tavilyMap` | Map a website's structure -- returns a list of URLs found starting from a base URL | Tavily API key |
| `tavilyResearch` | Comprehensive multi-source research on a topic. Returns a detailed synthesized response | Tavily API key |
| `tavilyResearchGet` | Retrieve the results of a previously started Tavily research task | Tavily API key |

### Academic / Knowledge (4)

| Tool | Description | Requires |
|------|-------------|----------|
| `githubSearch` | Search GitHub repositories, code, issues, users, commits, topics, and labels with full qualifier support | GitHub token (optional, for higher rate limits) |
| `arxivSearch` | Search arXiv preprints. Supports fielded search like `cat:cs.AI`, `ti:transformer`, `au:name` | -- (3s rate limit) |
| `arxivDownload` | Download arXiv paper PDF and save to vault. Auto-creates a source note with metadata | -- (3s rate limit) |
| `wikipedia` | Search Wikipedia or get full article content. Supports 300+ languages | -- |

### Reference (1)

| Tool | Description | Requires |
|------|-------------|----------|
| `baiduBaike` | Query Baidu Baike (Baidu Encyclopedia) for Chinese-language encyclopedic articles | Baidu API key (optional) |

## Installation

### From Community Plugins

1. Open Obsidian and go to **Settings > Community Plugins**.
2. Click **Browse** and search for "Notebrain".
3. Click **Install**, then **Enable**.

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/kiluahh/notebrain/releases).
2. Create a folder `notebrain` inside your vault's `.obsidian/plugins/` directory.
3. Copy the three files into the `notebrain` folder.
4. Restart Obsidian and enable the plugin in **Settings > Community Plugins**.

### BRAT (Beta Testing)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin.
2. In BRAT settings, click **Add Beta Plugin**.
3. Enter the repository URL: `https://github.com/kiluahh/notebrain`
4. Enable Notebrain in **Settings > Community Plugins**.

## Commands

| Command | Default Hotkey | Description |
|---------|---------------|-------------|
| Chat with Notebrain | `Ctrl+Shift+Enter` / `Cmd+Shift+Enter` | Start or continue an inline chat in the current note |
| Chat with Notebrain (no editor) | -- | Start chat from the command palette without an open editor |
| FIM Completion | -- | Trigger Fill-in-the-Middle completion at the `+++` marker |

## Ribbon Icons

- **Brain icon** -- Start inline chat in the active note.
- **Pen icon** -- Trigger FIM completion at the current cursor position.

## Requirements

- Obsidian **1.7.0** or later
- **DeepSeek API key** (from [platform.deepseek.com](https://platform.deepseek.com))
- Optional: [Tavily API key](https://tavily.com) for advanced web search
- Optional: [GitHub token](https://github.com/settings/tokens) for higher API rate limits
- Optional: Baidu AppBuilder key for Baidu Baike

## Compatibility

- **Desktop** -- Windows, macOS, Linux
- **Mobile** -- Android, iOS (vanilla DOM, no React, `requestUrl()` for CSP compliance)

## License

MIT
