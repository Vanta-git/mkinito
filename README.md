# KinitoPET Web Export

This is the browser export of KinitoPET. Start it with:

```bash
npm start
```

The export uses threaded WebAssembly, so it must be served over HTTP with
cross-origin isolation headers. Do not open `index.html` directly from the
file system.

Large runtime files are split into 3,000,000-byte chunks under `chunks/`. The service
worker reassembles `index.pck` and `index.wasm` at their original URLs, which
keeps the Godot export unchanged while avoiding large per-file upload limits.

## Numbered ZIP package

The `kinitopet-multi-001.zip` through `kinitopet-multi-009.zip` files are
ordinary independent ZIP archives. Put all nine archives in the same destination
folder, extract all nine there, and keep the resulting `chunks/` directory next
to `index.html`. Then run `npm start`.

For an easier local launch, double-click `start-game.bat` on Windows or run
`./start-game.sh` on macOS/Linux. These choose an available localhost port,
start the server, and open the game automatically. You can also run
`npm run play`. Do not double-click `index.html`; browsers disable the
cross-origin isolation that this threaded Godot export requires when a page
is opened directly from the file system.