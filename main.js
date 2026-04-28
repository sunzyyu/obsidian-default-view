"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => DefaultViewPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/constants.ts
var FRONTMATTER_KEY = "view-mode";
var VIEW_STATE_TYPE = {
  ["reading" /* Reading */]: "preview",
  ["editing" /* Editing */]: "source"
};
var PROCESSING_CLEANUP_DELAY_MS = 500;
var VIEW_SWITCH_DELAY_MS = 100;

// src/services/FrontMatterService.ts
var FrontMatterService = class {
  app;
  constructor(app) {
    this.app = app;
  }
  read(file) {
    const metadata = this.app.metadataCache.getFileCache(file);
    if (!metadata?.frontmatter) {
      return null;
    }
    const value = metadata.frontmatter[FRONTMATTER_KEY];
    if (value === "reading" /* Reading */ || value === "editing" /* Editing */) {
      return value;
    }
    return null;
  }
  async write(file, mode) {
    try {
      await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter[FRONTMATTER_KEY] = mode;
      });
    } catch (error) {
      console.warn("Default View Mode: failed to write frontmatter", error);
    }
  }
  async remove(file) {
    try {
      await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
        delete frontmatter[FRONTMATTER_KEY];
      });
    } catch (error) {
      console.warn("Default View Mode: failed to remove frontmatter key", error);
    }
  }
};

// src/services/ViewModeService.ts
var import_obsidian = require("obsidian");
var ViewModeService = class {
  processingPaths = /* @__PURE__ */ new Set();
  app;
  frontMatterService;
  constructor(app, frontMatterService) {
    this.app = app;
    this.frontMatterService = frontMatterService;
  }
  async handleFileOpen(file) {
    if (!file) {
      return;
    }
    if (this.processingPaths.has(file.path)) {
      return;
    }
    const desiredMode = this.frontMatterService.read(file);
    if (desiredMode === null) {
      return;
    }
    const leaf = this.getActiveMarkdownLeaf();
    if (!leaf) {
      return;
    }
    const currentViewType = leaf.getViewState().state?.mode;
    const expectedViewType = VIEW_STATE_TYPE[desiredMode];
    if (currentViewType === expectedViewType) {
      return;
    }
    setTimeout(() => {
      this.switchToView(leaf, desiredMode);
    }, VIEW_SWITCH_DELAY_MS);
  }
  markProcessing(path) {
    this.processingPaths.add(path);
    setTimeout(() => {
      this.processingPaths.delete(path);
    }, PROCESSING_CLEANUP_DELAY_MS);
  }
  async setCurrentFileMode(mode) {
    const file = this.getActiveFile();
    if (!file) {
      return;
    }
    this.markProcessing(file.path);
    await this.frontMatterService.write(file, mode);
  }
  async clearCurrentFileMode() {
    const file = this.getActiveFile();
    if (!file) {
      return;
    }
    this.markProcessing(file.path);
    await this.frontMatterService.remove(file);
  }
  dispose() {
    this.processingPaths.clear();
  }
  async switchToView(leaf, mode) {
    const state = leaf.getViewState();
    const newMode = VIEW_STATE_TYPE[mode];
    await leaf.setViewState(
      {
        ...state,
        state: { ...state.state, mode: newMode }
      },
      { history: false }
    );
  }
  getActiveFile() {
    return this.app.workspace.getActiveFile();
  }
  getActiveMarkdownLeaf() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    return view?.leaf ?? null;
  }
};

// src/commands/index.ts
function registerCommands(plugin, viewModeService) {
  plugin.addCommand({
    id: "set-reading-view-default",
    name: "Set reading view as default",
    callback: () => viewModeService.setCurrentFileMode("reading" /* Reading */)
  });
  plugin.addCommand({
    id: "set-editing-view-default",
    name: "Set editing view as default",
    callback: () => viewModeService.setCurrentFileMode("editing" /* Editing */)
  });
  plugin.addCommand({
    id: "clear-default-view",
    name: "Clear default view",
    callback: () => viewModeService.clearCurrentFileMode()
  });
}

// src/main.ts
var DefaultViewPlugin = class extends import_obsidian2.Plugin {
  frontMatterService;
  viewModeService;
  async onload() {
    this.frontMatterService = new FrontMatterService(this.app);
    this.viewModeService = new ViewModeService(this.app, this.frontMatterService);
    registerCommands(this, this.viewModeService);
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        this.viewModeService.handleFileOpen(file);
      })
    );
  }
  onunload() {
    this.viewModeService.dispose();
  }
};
