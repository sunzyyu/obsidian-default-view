export const PLUGIN_ID = 'default-view-mode';

export const FRONTMATTER_KEY = 'view-mode';

export enum ViewMode {
  Read = 'read',
  Edit = 'edit',
}

export const VIEW_STATE_TYPE: Record<ViewMode, string> = {
  [ViewMode.Read]: 'preview',
  [ViewMode.Edit]: 'source',
};

export const PROCESSING_CLEANUP_DELAY_MS = 500;

export const VIEW_SWITCH_DELAY_MS = 100;
