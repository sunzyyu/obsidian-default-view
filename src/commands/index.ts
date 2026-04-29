import { type Plugin } from 'obsidian';
import { ViewMode } from '../constants';
import { ViewModeService } from '../services/ViewModeService';

export function registerCommands(plugin: Plugin, viewModeService: ViewModeService): void {
  plugin.addCommand({
    id: 'set-read-view-default',
    name: 'Set view-mode: read',
    callback: async () => {
      await viewModeService.setCurrentFileMode(ViewMode.Read);
    },
  });

  plugin.addCommand({
    id: 'set-edit-view-default',
    name: 'Set view-mode: edit',
    callback: async () => {
      await viewModeService.setCurrentFileMode(ViewMode.Edit);
    },
  });

  plugin.addCommand({
    id: 'clear-default-view',
    name: 'Clear view-mode',
    callback: async () => {
      await viewModeService.clearCurrentFileMode();
    },
  });
}
