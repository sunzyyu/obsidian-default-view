import { type App, type TFile } from 'obsidian';
import { FRONTMATTER_KEY, ViewMode } from '../constants';

export class FrontMatterService {
  private readonly app: App;

  public constructor(app: App) {
    this.app = app;
  }

  public read(file: TFile): ViewMode | null {
    const metadata = this.app.metadataCache.getFileCache(file);
    if (!metadata?.frontmatter) {
      return null;
    }
    const value = metadata.frontmatter[FRONTMATTER_KEY];
    if (value === ViewMode.Reading || value === ViewMode.Editing) {
      return value;
    }
    return null;
  }

  public async write(file: TFile, mode: ViewMode): Promise<void> {
    try {
      await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter[FRONTMATTER_KEY] = mode;
      });
    } catch (error) {
      console.warn('Default View Mode: failed to write frontmatter', error);
    }
  }

  public async remove(file: TFile): Promise<void> {
    try {
      await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
        delete frontmatter[FRONTMATTER_KEY];
      });
    } catch (error) {
      console.warn('Default View Mode: failed to remove frontmatter key', error);
    }
  }
}
