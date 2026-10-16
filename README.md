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

The app is split into focused HTML, CSS, and JavaScript files and has no build step. Serve the repository with any static web server; for example:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the file map, storage schema, and guidance for common modifications.
