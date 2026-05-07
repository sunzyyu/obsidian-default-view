import { type App, MarkdownView, type OpenViewState, type PaneType, TFile, type Workspace, WorkspaceLeaf } from 'obsidian';
import { VIEW_MODE_APPLY_GUARD_DELAY_MS, VIEW_STATE_TYPE, ViewMode } from '../constants';
import { FrontMatterService } from './FrontMatterService';

type WorkspaceLeafOpenFile = WorkspaceLeaf['openFile'];
type WorkspaceOpenLinkText = Workspace['openLinkText'];

interface VaultConfig {
  getConfig(key: 'defaultViewMode'): unknown;
}

interface ResolvedOpenState {
  openState: OpenViewState | undefined;
  usesFrontMatterMode: boolean;
}

export class ViewModeService {
  private readonly app: App;
  private readonly frontMatterService: FrontMatterService;
  private originalOpenFile: WorkspaceLeafOpenFile | null = null;
  private originalOpenLinkText: WorkspaceOpenLinkText | null = null;
  private wrappedOpenFile: WorkspaceLeafOpenFile | null = null;
  private wrappedOpenLinkText: WorkspaceOpenLinkText | null = null;
  private defaultView: ViewMode;
  private lastObsidianDefaultView: ViewMode;
  private applyingViewModeCount = 0;
  private isDisposed = false;

  public constructor(app: App, frontMatterService: FrontMatterService) {
    this.app = app;
    this.frontMatterService = frontMatterService;
    this.defaultView = this.getObsidianDefaultView();
    this.lastObsidianDefaultView = this.defaultView;
    this.installOpenInterceptors();
  }

  public handleActiveLeafChange(): void {
    this.syncObsidianDefaultView();
  }

  public handleLayoutChange(): void {
    this.syncObsidianDefaultView();

    if (this.applyingViewModeCount > 0) {
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
    await this.frontMatterService.write(file, mode);
  }

  public async clearCurrentFileMode(): Promise<void> {
    const file = this.getActiveFile();
    if (!file) {
      return;
    }
    await this.frontMatterService.remove(file);
  }

  public dispose(): void {
    this.isDisposed = true;

    // If another plugin wrapped after us, keep that chain intact and only disable our wrapper.
    if (this.wrappedOpenFile && WorkspaceLeaf.prototype.openFile === this.wrappedOpenFile && this.originalOpenFile) {
      WorkspaceLeaf.prototype.openFile = this.originalOpenFile;
    }

    if (this.wrappedOpenLinkText && this.app.workspace.openLinkText === this.wrappedOpenLinkText && this.originalOpenLinkText) {
      this.app.workspace.openLinkText = this.originalOpenLinkText;
    }
  }

  private installOpenInterceptors(): void {
    const service = this;
    const originalOpenFile = WorkspaceLeaf.prototype.openFile;
    const originalOpenLinkText = this.app.workspace.openLinkText;

    const wrappedOpenFile: WorkspaceLeafOpenFile = function (
      this: WorkspaceLeaf,
      file: TFile,
      openState?: OpenViewState,
    ): Promise<void> {
      const resolved = service.isDisposed ? null : service.resolveOpenState(file, openState);
      const viewState = resolved?.openState ?? openState;
      const openFile = () => originalOpenFile.call(this, file, viewState);
      return resolved?.usesFrontMatterMode ? service.withApplyingViewMode(openFile) : openFile();
    };

    const wrappedOpenLinkText: WorkspaceOpenLinkText = function (
      this: Workspace,
      linktext: string,
      sourcePath: string,
      newLeaf?: PaneType | boolean,
      openViewState?: OpenViewState,
    ): Promise<void> {
      const file = service.isDisposed ? null : service.resolveLinkFile(linktext, sourcePath);
      const resolved = file ? service.resolveOpenState(file, openViewState) : null;
      const viewState = resolved?.openState ?? openViewState;
      const openLinkText = () => originalOpenLinkText.call(this, linktext, sourcePath, newLeaf, viewState);
      return resolved?.usesFrontMatterMode ? service.withApplyingViewMode(openLinkText) : openLinkText();
    };

    this.originalOpenFile = originalOpenFile;
    this.originalOpenLinkText = originalOpenLinkText;
    this.wrappedOpenFile = wrappedOpenFile;
    this.wrappedOpenLinkText = wrappedOpenLinkText;

    WorkspaceLeaf.prototype.openFile = wrappedOpenFile;
    this.app.workspace.openLinkText = wrappedOpenLinkText;
  }

  private getActiveFile(): TFile | null {
    return this.app.workspace.getActiveFile();
  }

  private resolveOpenState(file: TFile, openState?: OpenViewState): ResolvedOpenState {
    if (file.extension !== 'md') {
      return { openState, usesFrontMatterMode: false };
    }

    this.syncObsidianDefaultView();

    const frontMatterMode = this.frontMatterService.read(file);
    const mode = frontMatterMode ?? this.defaultView;

    return {
      openState: {
        ...openState,
        state: {
          ...openState?.state,
          mode: VIEW_STATE_TYPE[mode],
        },
      },
      usesFrontMatterMode: Boolean(frontMatterMode),
    };
  }

  private resolveLinkFile(linktext: string, sourcePath: string): TFile | null {
    return this.app.metadataCache.getFirstLinkpathDest(linktext, sourcePath) ?? this.resolveVaultFile(linktext);
  }

  private resolveVaultFile(path: string): TFile | null {
    const file = this.app.vault.getAbstractFileByPath(path);
    return file instanceof TFile ? file : null;
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

  private async withApplyingViewMode<T>(operation: () => Promise<T>): Promise<T> {
    this.applyingViewModeCount++;
    try {
      return await operation();
    } finally {
      activeWindow.setTimeout(() => {
        this.applyingViewModeCount = Math.max(0, this.applyingViewModeCount - 1);
      }, VIEW_MODE_APPLY_GUARD_DELAY_MS);
    }
  }
}
