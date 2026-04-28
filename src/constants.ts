export const PLUGIN_ID = 'obsidian-default-view';

export const FRONTMATTER_KEY = 'view-mode';

export enum ViewMode {
  Reading = 'reading',
  Editing = 'editing',
}

export const VIEW_STATE_TYPE: Record<ViewMode, string> = {
  [ViewMode.Reading]: 'preview',
  [ViewMode.Editing]: 'source',
};

export const PROCESSING_CLEANUP_DELAY_MS = 500;

export const VIEW_SWITCH_DELAY_MS = 100;
