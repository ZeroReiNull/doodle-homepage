# Doodle Homepage

A personal homepage for organizing website shortcuts. It supports categories, search, custom icons, themes, bilingual UI, drawing, and JSON backup.

## Branches

| Branch | Purpose |
| --- | --- |
| `dev` | Modular source code for development |
| `main` | Compiled single-file production build |

See [ARCHITECTURE.md](ARCHITECTURE.md) for the file map and storage schema.

## Build

Node.js 18 or newer is required. No package installation is needed.

```bash
npm run build
```

This creates [`dist/index.html`](dist/index.html) by inlining all local CSS and JavaScript. Edit the modular source files; do not edit the generated file directly.

## Publish

Push this branch to GitHub. The workflow automatically:

1. rebuilds `dist/index.html`;
2. commits the generated file to this branch when it changes;
3. publishes it as `main/index.html` for production.

User settings and uploaded icons are stored in browser `localStorage` and included in exported JSON backups.
