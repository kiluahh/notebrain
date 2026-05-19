import { App, PluginSettingTab, Setting } from "obsidian";
import type NotebrainPlugin from "../../main";
import { t } from "./i18n";

export interface NotebrainSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  thinkingEnabled: boolean;
  reasoningEffort: "high" | "max";
  tavilyKey: string;
  githubKey: string;
  baiduKey: string;
  yamlEnabled: boolean;
  noteTemplate: string;
  editPermissionTag: string;
  disabledTools: string[];
  headlessBrowserEndpoint: string;
  writeFrequency: number;
  language: string;
  temperature: number;
  notebrainMdPath: string;
  fimTemperature: number;
  fimMaxTokens: number;
  fimApiKey: string;
  fimBaseUrl: string;
  fimModel: string;
}

export const DEFAULT_SETTINGS: NotebrainSettings = {
  apiKey: "",
  baseUrl: "https://api.deepseek.com",
  model: "deepseek-v4-pro",
  thinkingEnabled: true,
  reasoningEffort: "high",
  tavilyKey: "",
  githubKey: "",
  baiduKey: "",
  yamlEnabled: true,
  noteTemplate: "",
  editPermissionTag: "#notebrain",
  disabledTools: [],
  headlessBrowserEndpoint: "",
  writeFrequency: 80,
  language: "zh",
  temperature: 0.7,
  notebrainMdPath: "NOTEBRAIN.md",
  fimTemperature: 1.0,
  fimMaxTokens: 1024,
  fimApiKey: "",
  fimBaseUrl: "https://api.deepseek.com",
  fimModel: "deepseek-v4-pro",
};

export class NotebrainSettingTab extends PluginSettingTab {
  plugin: NotebrainPlugin;

  constructor(app: App, plugin: NotebrainPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  private tr(key: string): string {
    return t(this.plugin.settings.language || "zh", key);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("chamberlain-settings");
    const _ = this.tr.bind(this);

    // ---- Toolbar ----
    const toolbar = containerEl.createEl("div", { cls: "chamberlain-settings-toolbar" });

    const tabs = ["basic", "model", "tools", "note", "fim"].map((id) =>
      toolbar.createEl("button", {
        text: _(`tab.${id}`),
        cls: `chamberlain-settings-tab${id === "basic" ? " active" : ""}`,
      }),
    );
    const [basicTab, modelTab, toolsTab, noteTab, fimTab] = tabs;

    // ---- Content panels ----
    const panels = tabs.map(() => containerEl.createEl("div", { cls: "chamberlain-settings-panel" }));
    const [basicPanel, modelPanel, toolsPanel, notePanel, fimPanel] = panels;
    panels.slice(1).forEach((p) => (p.style.display = "none"));

    const switchTab = (activeIdx: number) => {
      tabs.forEach((t, i) => {
        if (i === activeIdx) t.addClass("active");
        else t.removeClass("active");
      });
      panels.forEach((p, i) => {
        p.style.display = i === activeIdx ? "block" : "none";
      });
    };
    basicTab.onclick = () => switchTab(0);
    modelTab.onclick = () => switchTab(1);
    toolsTab.onclick = () => switchTab(2);
    noteTab.onclick = () => switchTab(3);
    fimTab.onclick = () => switchTab(4);

    this.buildBasicPanel(basicPanel);
    this.buildModelPanel(modelPanel);
    this.buildToolsPanel(toolsPanel);
    this.buildNotePanel(notePanel);
    this.buildFimPanel(fimPanel);
  }

  private buildBasicPanel(el: HTMLElement) {
    const _ = this.tr.bind(this);

    new Setting(el)
      .setName(_("basic.language"))
      .setDesc(_("basic.languageDesc"))
      .addDropdown((d) =>
        d
          .addOption("zh", "中文")
          .addOption("en", "English")
          .setValue(this.plugin.settings.language || "zh")
          .onChange(async (v) => {
            this.plugin.settings.language = v;
            await this.plugin.saveSettings();
            this.display(); // re-render with new language
          }),
      );

    new Setting(el)
      .setName(_("basic.notebrainMdPath"))
      .setDesc(_("basic.notebrainMdPathDesc"))
      .addDropdown((d) => {
        d.addOption("NOTEBRAIN.md", "NOTEBRAIN.md (root)");
        const notebrainFiles = this.app.vault.getMarkdownFiles()
          .filter((f) => f.basename.toLowerCase() === "notebrain" && f.path !== "NOTEBRAIN.md");
        for (const f of notebrainFiles) {
          d.addOption(f.path, f.path);
        }
        d.setValue(this.plugin.settings.notebrainMdPath || "NOTEBRAIN.md");
        d.onChange(async (v) => {
          this.plugin.settings.notebrainMdPath = v;
          await this.plugin.saveSettings();
        });
      });

    new Setting(el)
      .setName(_("basic.writeFrequency"))
      .setDesc(_("basic.writeFrequencyDesc"))
      .addText((t) =>
        t
          .setPlaceholder("80")
          .setValue(String(this.plugin.settings.writeFrequency))
          .onChange(async (v) => {
            const n = parseInt(v, 10);
            if (!isNaN(n) && n >= 20 && n <= 500) {
              this.plugin.settings.writeFrequency = n;
              await this.plugin.saveSettings();
            }
          }),
      );
  }

  private buildModelPanel(el: HTMLElement) {
    const _ = this.tr.bind(this);

    new Setting(el)
      .setName(_("model.apiKey"))
      .setDesc(_("model.apiKeyDesc"))
      .addText((t) =>
        t
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (v) => {
            this.plugin.settings.apiKey = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(el)
      .setName(_("model.baseUrl"))
      .setDesc(_("model.baseUrlDesc"))
      .addText((t) =>
        t
          .setPlaceholder("https://api.deepseek.com")
          .setValue(this.plugin.settings.baseUrl)
          .onChange(async (v) => {
            this.plugin.settings.baseUrl = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    // Model: text input + dynamic fetch from API
    const modelSetting = new Setting(el)
      .setName(_("model.model"))
      .setDesc(_("model.modelDesc"))
      .addText((t) =>
        t
          .setPlaceholder("deepseek-v4-pro")
          .setValue(this.plugin.settings.model)
          .onChange(async (v) => {
            this.plugin.settings.model = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    // Fetch available models and show them
    const refreshModels = async () => {
      try {
        const models = await this.plugin.client.listModels();
        if (models.length > 0) {
          modelSetting.setDesc(
            `${_("model.modelDesc")}  ${_("model.available")}: ${models.slice(0, 8).join(", ")}`,
          );
        }
      } catch { /* ignore */ }
    };
    refreshModels();

    new Setting(el)
      .setName(_("model.thinking"))
      .setDesc(_("model.thinkingDesc"))
      .addToggle((t) =>
        t.setValue(this.plugin.settings.thinkingEnabled).onChange(async (v) => {
          this.plugin.settings.thinkingEnabled = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(el)
      .setName(_("model.reasoningEffort"))
      .setDesc(_("model.reasoningEffortDesc"))
      .addDropdown((d) =>
        d
          .addOption("high", "high")
          .addOption("max", "max")
          .setValue(this.plugin.settings.reasoningEffort)
          .onChange(async (v) => {
            this.plugin.settings.reasoningEffort = v as "high" | "max";
            await this.plugin.saveSettings();
          }),
      );

    new Setting(el)
      .setName(_("model.temperature"))
      .setDesc(_("model.temperatureDesc"))
      .addText((t) =>
        t
          .setPlaceholder("0.7")
          .setValue(String(this.plugin.settings.temperature))
          .onChange(async (v) => {
            const n = parseFloat(v);
            if (!isNaN(n) && n >= 0 && n <= 2) {
              this.plugin.settings.temperature = n;
              await this.plugin.saveSettings();
            }
          }),
      );
  }

  private buildNotePanel(el: HTMLElement) {
    const _ = this.tr.bind(this);

    new Setting(el)
      .setName(_("note.yaml"))
      .setDesc(_("note.yamlDesc"))
      .addToggle((t) =>
        t.setValue(this.plugin.settings.yamlEnabled).onChange(async (v) => {
          this.plugin.settings.yamlEnabled = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(el)
      .setName(_("note.editPermissionTag"))
      .setDesc(_("note.editPermissionTagDesc"))
      .addText((t) =>
        t
          .setPlaceholder("#notebrain")
          .setValue(this.plugin.settings.editPermissionTag)
          .onChange(async (v) => {
            let tag = v.trim();
            if (tag && !tag.startsWith("#")) tag = "#" + tag;
            this.plugin.settings.editPermissionTag = tag || "#notebrain";
            await this.plugin.saveSettings();
          }),
      );

    const files = this.app.vault.getMarkdownFiles();
    new Setting(el)
      .setName(_("note.noteTemplate"))
      .setDesc(_("note.noteTemplateDesc"))
      .addDropdown((d) => {
        d.addOption("", _("note.templateNone"));
        for (const f of files) {
          d.addOption(f.path, f.path);
        }
        d.setValue(this.plugin.settings.noteTemplate || "");
        d.onChange(async (v) => {
          this.plugin.settings.noteTemplate = v;
          await this.plugin.saveSettings();
        });
      });
  }

  private buildToolsPanel(el: HTMLElement) {
    const _ = this.tr.bind(this);

    el.createEl("h3", { text: _("tools.apiKeys") });

    new Setting(el)
      .setName(_("tools.tavilyKey"))
      .setDesc(_("tools.tavilyKeyDesc"))
      .addText((t) =>
        t
          .setPlaceholder("tvly-...")
          .setValue(this.plugin.settings.tavilyKey)
          .onChange(async (v) => {
            this.plugin.settings.tavilyKey = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(el)
      .setName(_("tools.githubKey"))
      .setDesc(_("tools.githubKeyDesc"))
      .addText((t) =>
        t
          .setPlaceholder("ghp_...")
          .setValue(this.plugin.settings.githubKey)
          .onChange(async (v) => {
            this.plugin.settings.githubKey = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(el)
      .setName(_("tools.baiduKey"))
      .setDesc(_("tools.baiduKeyDesc"))
      .addText((t) =>
        t
          .setPlaceholder("bce-...")
          .setValue(this.plugin.settings.baiduKey)
          .onChange(async (v) => {
            this.plugin.settings.baiduKey = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(el)
      .setName(_("tools.headlessBrowser"))
      .setDesc(_("tools.headlessBrowserDesc"))
      .addText((t) =>
        t
          .setPlaceholder("https://...")
          .setValue(this.plugin.settings.headlessBrowserEndpoint)
          .onChange(async (v) => {
            this.plugin.settings.headlessBrowserEndpoint = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    el.createEl("h3", { text: _("tools.availableTools") });

    const toolNames = [
      "searchNotes", "readNote", "listFolder", "getBacklinks",
      "createNote", "editNote", "getCurrentTime", "webSearch", "cnNews", "webFetch",
      "tavilySearch", "tavilyExtract", "tavilyMap", "tavilyCrawl",
      "tavilyResearch", "tavilyResearchGet", "githubSearch",
      "arxivSearch", "arxivDownload", "baiduBaike", "wikipedia",
    ];

    for (const name of toolNames) {
      const disabled = this.plugin.settings.disabledTools;
      new Setting(el)
        .setName(_(`toolName.${name}`))
        .setDesc(_(`tool.${name}`))
        .addToggle((toggle) =>
          toggle.setValue(!disabled.includes(name)).onChange(async (v) => {
            if (v) {
              this.plugin.settings.disabledTools = disabled.filter((n) => n !== name);
            } else {
              if (!disabled.includes(name)) disabled.push(name);
            }
            await this.plugin.saveSettings();
          }),
        );
    }
  }

  private buildFimPanel(el: HTMLElement) {
    const _ = this.tr.bind(this);

    el.createEl("h3", { text: _("fim.apiSettings") });

    new Setting(el)
      .setName(_("fim.apiKey"))
      .setDesc(_("fim.apiKeyDesc"))
      .addText((t) =>
        t
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.fimApiKey)
          .onChange(async (v) => {
            this.plugin.settings.fimApiKey = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(el)
      .setName(_("fim.baseUrl"))
      .setDesc(_("fim.baseUrlDesc"))
      .addText((t) =>
        t
          .setPlaceholder("https://api.deepseek.com")
          .setValue(this.plugin.settings.fimBaseUrl)
          .onChange(async (v) => {
            this.plugin.settings.fimBaseUrl = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(el)
      .setName(_("fim.model"))
      .setDesc(_("fim.modelDesc"))
      .addText((t) =>
        t
          .setPlaceholder("deepseek-v4-pro")
          .setValue(this.plugin.settings.fimModel)
          .onChange(async (v) => {
            this.plugin.settings.fimModel = v.trim();
            await this.plugin.saveSettings();
          }),
      );

    el.createEl("h3", { text: _("fim.params") });

    new Setting(el)
      .setName(_("fim.temperature"))
      .setDesc(_("fim.temperatureDesc"))
      .addText((t) =>
        t
          .setPlaceholder("1.0")
          .setValue(String(this.plugin.settings.fimTemperature))
          .onChange(async (v) => {
            const n = parseFloat(v);
            if (!isNaN(n) && n >= 0 && n <= 2) {
              this.plugin.settings.fimTemperature = n;
              await this.plugin.saveSettings();
            }
          }),
      );

    new Setting(el)
      .setName(_("fim.maxTokens"))
      .setDesc(_("fim.maxTokensDesc"))
      .addText((t) =>
        t
          .setPlaceholder("1024")
          .setValue(String(this.plugin.settings.fimMaxTokens))
          .onChange(async (v) => {
            const n = parseInt(v, 10);
            if (!isNaN(n) && n >= 1 && n <= 4096) {
              this.plugin.settings.fimMaxTokens = n;
              await this.plugin.saveSettings();
            }
          }),
      );

    el.createEl("h3", { text: _("fim.usage") });
    el.createEl("pre", {
      text: `${_("fim.usageTitle")}

  ${_("fim.usage1")}
    前文内容...
    +++
    后文内容...

  ${_("fim.usage2")}
    第一章开始...
    +++512

  ${_("fim.usage3")}
    待续写段落...
    +++`,
      cls: "notebrain-fim-usage",
    });
  }
}
