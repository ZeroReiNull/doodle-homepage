# Doodle Homepage

This is the production branch. [`index.html`](index.html) is the compiled single-file homepage and can be hosted directly with GitHub Pages or any static web server.

## Development

Do not edit the production HTML directly. Make changes in the [`dev`](https://github.com/ZeroReiNull/doodle-homepage/tree/dev) branch, where the HTML, CSS, and JavaScript are split into readable modules.

Publishing is automatic:

1. push changes to the source branch;
2. GitHub Actions builds the single HTML file;
3. the generated file replaces `main/index.html`.

User settings and uploaded icons are stored in browser `localStorage`. They can be moved between browsers with the built-in JSON backup.
