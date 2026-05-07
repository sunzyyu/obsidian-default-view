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

export const VIEW_MODE_APPLY_GUARD_DELAY_MS = 100;
