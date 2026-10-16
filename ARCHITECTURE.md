# Doodle Homepage architecture

The project has no runtime dependencies. Serve the modular source as static files during development, or use the optional build script to produce one HTML file.

## File map

`index.html` contains semantic page structure and dialog markup. It intentionally contains no application logic or embedded styles.

Styles load in this order:

1. `css/base.css` — theme variables, reset rules, typography, and page layout.
2. `css/components.css` — cards, controls, search, footer, and doodle-pad visuals.
3. `css/dialogs.css` — dialogs, forms, management pages, icon pickers, and theme controls.
4. `css/effects.css` — floating interactions, responsive rules, and reduced-motion overrides.

Scripts load in dependency order:

1. `js/i18n-theme.js` — translation lookup and theme preferences. It loads in `<head>` to apply the saved theme early.
2. `js/icons.js` — built-in icons, custom-image validation, crop UI, favicon fallback paths, and icon pickers.
3. `js/state-render.js` — application state and rendering for the homepage and management lists.
4. `js/management.js` — dialog navigation and editing handlers for categories, websites, profile, search, language, and theme.
5. `js/backup.js` — backup export, validation, and restore.
6. `js/doodle.js` — drawing canvas behavior.
7. `js/hover.js` — stable wrappers for floating hover effects.
8. `js/app.js` — small application entry point.

These are ordered classic scripts because the page is designed to work when served by any basic static server without a bundler. Shared bindings are declared once and consumed only by files loaded after them. Each file header lists its role and important dependencies.

## Single-file output

Run `npm run build` to generate `dist/index.html`. The script reads `index.html`, finds local stylesheet and script references, and inlines them in their existing order. It deliberately leaves remote webfont links unchanged.

The build has no package dependencies and requires Node.js 18 or newer. `dist/index.html` is generated output and should not be edited directly. GitHub Actions runs the same command on every source push and pull request. For pushes, it commits an updated file back to the source branch so the result is visible in the GitHub file browser. It also uploads the file as the `doodle-homepage-single-file` artifact.

## Stored data

Browser state uses these `localStorage` keys:

| Key | Contents |
| --- | --- |
| `doodle_sites_v1` | Website cards, order, categories, and icon data |
| `doodle_categories_v1` | Ordered category names |
| `doodle_profile_v1` | Homepage title, bio, tab title, and favicon |
| `doodle_theme_v1` | `light`, `dark`, or `system` |
| `doodle_language_v1` | `en` or `zh-CN` |

Uploaded icons are PNG data URLs after cropping. The backup JSON uses the same schema, and `normalizeConfig()` in `js/backup.js` is the compatibility boundary for imported files. Keep existing property names when changing the UI so old browser data and backups continue to load.

## Common changes

- Add or rename translated text in the `EN` map in `js/i18n-theme.js`, then use the Chinese source string with `data-i18n` or `t()`.
- Add a built-in icon in `ICONS` and `ICON_LABELS` in `js/icons.js`.
- Change card markup in `renderSites()` in `js/state-render.js`.
- Change website editing in the site-modal section of `index.html` and its matching handlers in `js/management.js`.
- Change backup validation in `normalizeConfig()` in `js/backup.js`.
- Change responsive or hover behavior in `css/effects.css`.
- Change crop resolution with `CROPPED_ICON_SIZE` in `js/icons.js`.

## Local development

Start a server from the repository root:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Use a consistent origin and port when testing persisted browser data because `localStorage` is scoped to the origin.

After changes, check the browser console and exercise website editing, custom-image cropping, search, language/theme persistence, JSON export/import, and touch interaction. Automatic website icons intentionally try common root paths in order; sites with unusual icon paths still need a custom upload.
