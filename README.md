# KinitoPET Web Export

This is a static browser export of KinitoPET. Upload the files and `chunks/`
directory to your website, keeping the same folder structure.

The export uses threaded WebAssembly, so your site must send these headers on
the game page and its assets:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

The site must use HTTPS (or localhost during testing), and the game must be
opened from its website URL. Do not open `index.html` directly from the file
system.

Large runtime files are split into 3,000,000-byte chunks under `chunks/`. The service
worker reassembles `index.pck` and `index.wasm` at their original URLs, which
keeps the Godot export unchanged while avoiding large per-file upload limits.

## Numbered ZIP package

The `kinitopet-multi-001.zip` through `kinitopet-multi-009.zip` files are
ordinary independent ZIP archives. Put all nine archives in the same destination
folder, extract all nine there, and keep the resulting `chunks/` directory next
to `index.html`. Upload that extracted folder to your site.