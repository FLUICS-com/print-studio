# FLUICS PRINT Studio

Print labels on FLUICS online label printers from your browser: one label, a batch with counters and dates, label bundles, or one label per row pasted from Excel or uploaded as .xlsx/.csv. PRINT Studio is a single HTML file with no build step and no server-side code.

## Use it

1. Download `index.html` (or the release of your choice under Releases/Tags).
2. Open it in a current browser, or upload it to any static web server to use it on phones and tablets.
3. Click the gear icon, Connect printer, and enter your FLUICS PRINT API key. Request a key at connect@fluics.com.

Optional: import `examples/print-studio-config-example.json` (gear icon, General, Configuration file) for example templates and bundles.

Everything you configure (API key, templates, bundles, audit log) is stored only in this browser on this device. Export the configuration to back it up or move it to another computer. Exports contain the API key: keep them private.

## Documentation

- User manual: [docs/manual.md](docs/manual.md) ([PDF](docs/manual.pdf)), also built into the app (book icon).
- FLUICS PRINT API documentation (Swagger): https://printers.fluics.com/fluics/printapi-docs/prod/

## Third-party services and libraries

Loaded at runtime from CDNs under their own licenses: Tailwind CSS (MIT), ZXing (Apache-2.0), SheetJS (Apache-2.0). The optional label preview uses the Labelary online service (labelary.com); label content is sent there only while the preview is switched on.

## Building the manual PDF

`python3 tools/build_manual_pdf.py docs/manual.md` (needs the `markdown` package, Google Chrome and the FLUICS brand assets, see the script header).

## Support

FLUICS GmbH, Fürstenstr. 15, 80333 München, Germany. support@fluics.com, https://fluics.com

## License

MIT, see [LICENSE](LICENSE). The software is provided as is and used under your own responsibility: check every label in the preview before printing.
