import { type App, type TFile, type WorkspaceLeaf, MarkdownView } from 'obsidian';
import { VIEW_STATE_TYPE, ViewMode, PROCESSING_CLEANUP_DELAY_MS, VIEW_SWITCH_DELAY_MS } from '../constants';
import { FrontMatterService } from './FrontMatterService';

interface VaultConfig {
  getConfig(key: 'defaultViewMode'): unknown;
}

export class ViewModeService {
  private readonly processingPaths: Set<string> = new Set();
  private readonly app: App;
  private readonly frontMatterService: FrontMatterService;
  private defaultView: ViewMode;
  private lastObsidianDefaultView: ViewMode;
  private isApplyingViewMode = false;

  public constructor(app: App, frontMatterService: FrontMatterService) {
    this.app = app;
    this.frontMatterService = frontMatterService;
    this.defaultView = this.getObsidianDefaultView();
    this.lastObsidianDefaultView = this.defaultView;
  }

  public handleFileOpen(file: TFile | null): void {
    this.syncObsidianDefaultView();

    if (!file) {
      return;
    }

    if (this.processingPaths.has(file.path)) {
      return;
    }

    const desiredMode = this.frontMatterService.read(file) ?? this.defaultView;

    const leaf = this.getActiveMarkdownLeaf();
    if (!leaf) {
      return;
    }

    const currentViewType = leaf.getViewState().state?.mode;
    const expectedViewType = VIEW_STATE_TYPE[desiredMode];
    if (currentViewType === expectedViewType) {
      return;
    }

    // Delay to avoid conflicting with Obsidian's own state restoration
    activeWindow.setTimeout(() => {
      this.switchToView(leaf, desiredMode);
    }, VIEW_SWITCH_DELAY_MS);
  }

  public markProcessing(path: string): void {
    this.processingPaths.add(path);
    activeWindow.setTimeout(() => {
      this.processingPaths.delete(path);
    }, PROCESSING_CLEANUP_DELAY_MS);
  }

  public handleActiveLeafChange(): void {
    this.syncObsidianDefaultView();
  }

  public handleLayoutChange(): void {
    this.syncObsidianDefaultView();

    if (this.isApplyingViewMode) {
      return;
    }

    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const mode = view ? this.toViewMode(view.getMode()) : null;
    if (!mode) {
      return;
    }

    this.defaultView = mode;
  }

  public async setCurrentFileMode(mode: ViewMode): Promise<void> {
    const file = this.getActiveFile();
    if (!file) {
      return;
    }
    this.markProcessing(file.path);
    await this.frontMatterService.write(file, mode);
  }

  public async clearCurrentFileMode(): Promise<void> {
    const file = this.getActiveFile();
    if (!file) {
      return;
    }
    this.markProcessing(file.path);
    await this.frontMatterService.remove(file);
  }

  public dispose(): void {
    this.processingPaths.clear();
  }

  private switchToView(leaf: WorkspaceLeaf, mode: ViewMode): void {
    const state = leaf.getViewState();
    const newMode = VIEW_STATE_TYPE[mode];

    this.isApplyingViewMode = true;
    void leaf.setViewState(
      {
        ...state,
        state: { ...state.state, mode: newMode },
      },
      { history: false },
    ).then(
      () => {
        this.clearApplyingViewMode();
      },
      (error) => {
        console.warn('Default View Mode: failed to switch view mode', error);
        this.clearApplyingViewMode();
      },
    );
  }

  private getActiveFile(): TFile | null {
    return this.app.workspace.getActiveFile();
  }

  private getActiveMarkdownLeaf(): WorkspaceLeaf | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    return view?.leaf ?? null;
  }

  private getObsidianDefaultView(): ViewMode {
    const defaultMode = (this.app.vault as unknown as VaultConfig).getConfig('defaultViewMode');
    return defaultMode === 'preview' ? ViewMode.Read : ViewMode.Edit;
  }

  private syncObsidianDefaultView(): void {
    const obsidianDefaultView = this.getObsidianDefaultView();
    if (obsidianDefaultView === this.lastObsidianDefaultView) {
      return;
    }

    this.lastObsidianDefaultView = obsidianDefaultView;
    this.defaultView = obsidianDefaultView;
  }

  private toViewMode(mode: string): ViewMode | null {
    if (mode === VIEW_STATE_TYPE[ViewMode.Read]) {
      return ViewMode.Read;
    }
    if (mode === VIEW_STATE_TYPE[ViewMode.Edit]) {
      return ViewMode.Edit;
    }
    return null;
  }

  private clearApplyingViewMode(): void {
    activeWindow.setTimeout(() => {
      this.isApplyingViewMode = false;
    }, VIEW_SWITCH_DELAY_MS);
  }
}
