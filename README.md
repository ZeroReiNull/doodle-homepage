# Doodle Homepage

A lightweight personal homepage for organizing the websites, tools, and dashboards you use every day.

It is a small static web app with:

- a homepage for favorite links
- category filtering and search
- a doodle pad for fun
- light/dark mode and language switching
- editable homepage title, bio, favicon, and browser tab title
- local backup/import/export so your setup survives

## Notes
Everything is stored in the browser using `localStorage`, so your setup persists on the same browser/device unless you clear site data.

## Development

The app is split into focused HTML, CSS, and JavaScript files. You can serve the source directly with any static web server; for example:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the file map, storage schema, and guidance for common modifications.

## Single-file build

Run the dependency-free build script to inline all local CSS and JavaScript into one portable HTML file:

```bash
npm run build
```

The result is written to `dist/index.html`. External webfont links remain external, while the complete application code and styling are contained in the generated file.

The `Build single-file homepage` GitHub Actions workflow runs on every push and pull request. Download `doodle-homepage-single-file` from the workflow run's **Artifacts** section to get the generated HTML file.
