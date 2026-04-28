import { Plugin } from 'obsidian';
import { FrontMatterService } from './services/FrontMatterService';
import { ViewModeService } from './services/ViewModeService';
import { registerCommands } from './commands';

// default export required by Obsidian plugin protocol
export default class DefaultViewPlugin extends Plugin {
  private frontMatterService!: FrontMatterService;
  private viewModeService!: ViewModeService;

  public override async onload(): Promise<void> {
    this.frontMatterService = new FrontMatterService(this.app);
    this.viewModeService = new ViewModeService(this.app, this.frontMatterService);

    registerCommands(this, this.viewModeService);

    this.registerEvent(
      this.app.workspace.on('file-open', (file) => {
        this.viewModeService.handleFileOpen(file);
      }),
    );
  }

  public override onunload(): void {
    this.viewModeService.dispose();
  }
}
