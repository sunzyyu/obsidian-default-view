# Default View Mode

Set a default view mode — `read` or `edit` — for each note individually via frontmatter. Open your homepage in read view, your daily notes in edit view, and everything else however you like.

## Features

- **Per-note default view** — each note remembers its preferred view mode through a simple frontmatter field
- **Automatic switching** — the view switches as soon as you open a note, no extra clicks
- **Command palette support** — three commands to set or clear a note's default view without leaving the keyboard
- **Zero-config** — no settings tab, no global toggles; everything is controlled at the note level

## How It Works

The plugin reads a `view-mode` key from each note's YAML frontmatter. When you open a note, it checks the key and switches to the matching view. If no key is set, Obsidian's default behavior is left unchanged.

```yaml
---
view-mode: read
---
```

## Commands

| Command | Description |
|---------|-------------|
| **Set view-mode: read** | Adds `view-mode: read` to the active note's frontmatter |
| **Set view-mode: edit** | Adds `view-mode: edit` to the active note's frontmatter |
| **Clear view-mode** | Removes the `view-mode` key from the active note's frontmatter |

## Installation

### Community Plugin Gallery

Once accepted, this plugin will be available in the Obsidian Community Plugin gallery.

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Copy them into `{vault}/.obsidian/plugins/default-view-mode/`
3. Reload Obsidian and enable the plugin under **Settings → Community Plugins**

## Compatibility

- Requires Obsidian **1.12.0** or later
- Works on desktop and mobile

## License

MIT
