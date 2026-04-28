import { type Plugin } from 'obsidian';
import { ViewMode } from '../constants';
import { ViewModeService } from '../services/ViewModeService';

export function registerCommands(plugin: Plugin, viewModeService: ViewModeService): void {
  plugin.addCommand({
    id: 'set-reading-view-default',
    name: 'Set Reading View as Default',
    callback: () => viewModeService.setCurrentFileMode(ViewMode.Reading),
  });

  plugin.addCommand({
    id: 'set-editing-view-default',
    name: 'Set Editing View as Default',
    callback: () => viewModeService.setCurrentFileMode(ViewMode.Editing),
  });

  plugin.addCommand({
    id: 'clear-default-view',
    name: 'Clear Default View',
    callback: () => viewModeService.clearCurrentFileMode(),
  });
}
