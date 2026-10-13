# PRINT Studio, conventions

- Everything is in `index.html` (markup, style, script). Read the header comment of the `<script>` block first: module order, state shape, migration rules.
- Never remove a `loadState()` migration step: customers import configs exported from old versions.
- Release: bump `APP_VERSION`, add a changelog line in the header comment, update `docs/manual.md`, re-inject the manual into `#help-content`, rebuild `docs/manual.pdf`, then tag `vX.Y`.
- Never commit an API key, printer names or audit logs. `examples/` configs have an empty `apiKey`.
- UI and docs text: no em dashes or en dashes.
- Generated markup never gets inline handlers with interpolated values: use `${uiOn('click', 'fn', args…)}` and add `fn` to `UI_HANDLERS`. Config import rejects ids outside `CONFIG_ID_RE`. Regression test: serve the repo root on a spare port (`python3 -m http.server 8770`) and open `/tests/injection-test.html`; it must say "All … checks passed".
- Tests: `node tests/zpl.test.js` (ZPL substitution, copy limits) and, served on a spare port, `tests/injection-test.html` and `tests/print-result-test.html` (mocked print API). All must pass before a release. The print API limits (^PQ ≤ 10 per label, ≤ 100 copies per request, unique label ids) come from fluics-printingapi `src/print_api_neo.py`; only `labels[].status === 'OK'` means printed.
- Labelary only with consent (`labelaryOn()`); exports: `exportState('share')` has no API key or audit log, `exportState('backup')` has both.
