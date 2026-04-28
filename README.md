# Default View Mode

Set a default view mode — reading or editing — for each note individually via frontmatter. Open your homepage in reading view, your daily notes in editing view, and everything else however you like.

## Features

- **Per-note default view** — each note remembers its preferred view mode through a simple frontmatter field
- **Automatic switching** — the view switches as soon as you open a note, no extra clicks
- **Command palette support** — three commands to set or clear a note's default view without leaving the keyboard
- **Zero-config** — no settings tab, no global toggles; everything is controlled at the note level

## How It Works

The plugin reads a `view-mode` key from each note's YAML frontmatter. When you open a note, it checks the key and switches to the matching view. If no key is set, Obsidian's default behavior is left unchanged.

```yaml
---
view-mode: reading
---
```

## Commands

| Command | Description |
|---------|-------------|
| **Set Reading View as Default** | Adds `view-mode: reading` to the active note's frontmatter |
| **Set Editing View as Default** | Adds `view-mode: editing` to the active note's frontmatter |
| **Clear Default View** | Removes the `view-mode` key from the active note's frontmatter |

## Installation

### Community Plugin Gallery (Recommended)

Available in the Obsidian Community Plugin gallery.

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Copy them into `{vault}/.obsidian/plugins/obsidian-default-view/`
3. Reload Obsidian and enable the plugin under **Settings → Community Plugins**

## Compatibility

- Requires Obsidian **1.12.0** or later
- Works on desktop and mobile

## License

MIT
