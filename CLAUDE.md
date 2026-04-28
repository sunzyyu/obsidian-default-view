# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Obsidian plugin that sets a default view mode (reading or editing) per note via YAML frontmatter (`view-mode: reading` | `editing`). Three commands allow setting/clearing the default view for the active file. On file-open, the plugin reads the frontmatter and switches to the requested view after a short delay to avoid conflicting with Obsidian's own state restoration.

## Build / Dev

```bash
npm install          # install dependencies
npm run build        # production build → main.js
npm run dev          # watch mode (rebuilds on change)
npx tsc --noEmit     # type-check only
```

## Architecture

```
src/
├── main.ts                          # Plugin entry — thin, wires services + commands + events
├── constants.ts                     # PLUGIN_ID, FRONTMATTER_KEY, ViewMode enum, delays
├── types.ts                         # PluginSettings interface (reserved for future config)
├── services/
│   ├── FrontMatterService.ts        # Read/write/remove view-mode in note frontmatter via metadataCache & fileManager
│   └── ViewModeService.ts           # Core: file-open handler, view-switch logic, dedup Set to avoid re-trigger
└── commands/
    └── index.ts                     # Registers 3 commands: Set Reading/Editing/Clear Default View
```

Services receive `App` via constructor injection (no global `app` references). The only `default export` is the Plugin class in `main.ts` — required by Obsidian's plugin protocol. All other modules use named exports.

## Dependencies

- `obsidian` 1.12.x (type stubs only — excluded from bundle)
- `typescript` ~6.0.2
- `esbuild` for bundling (CJS output, `obsidian`/codemirror/lezer are externals)
