import { type Plugin } from 'obsidian';
import { ViewMode } from '../constants';
import { ViewModeService } from '../services/ViewModeService';

export function registerCommands(plugin: Plugin, viewModeService: ViewModeService): void {
  plugin.addCommand({
    id: 'set-reading-view-default',
    name: 'Set reading view as default',
    callback: () => viewModeService.setCurrentFileMode(ViewMode.Reading),
  });

  plugin.addCommand({
    id: 'set-editing-view-default',
    name: 'Set editing view as default',
    callback: () => viewModeService.setCurrentFileMode(ViewMode.Editing),
  });

  plugin.addCommand({
    id: 'clear-default-view',
    name: 'Clear default view',
    callback: () => viewModeService.clearCurrentFileMode(),
  });
}
