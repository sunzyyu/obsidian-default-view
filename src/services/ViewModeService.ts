import { type App, type TFile, type WorkspaceLeaf, MarkdownView } from 'obsidian';
import { VIEW_STATE_TYPE, ViewMode, PROCESSING_CLEANUP_DELAY_MS, VIEW_SWITCH_DELAY_MS } from '../constants';
import { FrontMatterService } from './FrontMatterService';

export class ViewModeService {
  private readonly processingPaths: Set<string> = new Set();
  private readonly app: App;
  private readonly frontMatterService: FrontMatterService;

  public constructor(app: App, frontMatterService: FrontMatterService) {
    this.app = app;
    this.frontMatterService = frontMatterService;
  }

  public async handleFileOpen(file: TFile | null): Promise<void> {
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

    // Delay to avoid conflicting with Obsidian's own state restoration
    setTimeout(() => {
      this.switchToView(leaf, desiredMode);
    }, VIEW_SWITCH_DELAY_MS);
  }

  public markProcessing(path: string): void {
    this.processingPaths.add(path);
    setTimeout(() => {
      this.processingPaths.delete(path);
    }, PROCESSING_CLEANUP_DELAY_MS);
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

  private async switchToView(leaf: WorkspaceLeaf, mode: ViewMode): Promise<void> {
    const state = leaf.getViewState();
    const newMode = VIEW_STATE_TYPE[mode];

    await leaf.setViewState(
      {
        ...state,
        state: { ...state.state, mode: newMode },
      },
      { history: false },
    );
  }

  private getActiveFile(): TFile | null {
    return this.app.workspace.getActiveFile();
  }

  private getActiveMarkdownLeaf(): WorkspaceLeaf | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    return view?.leaf ?? null;
  }
}
