#!/usr/bin/env python3
"""Make the label templates of a configuration export the factory defaults.

Usage: python3 tools/set_default_templates.py <exported-config.json>

Replaces the `templates` of DEFAULTS in PRINTStudio.html (used after
"Reset app to factory defaults" and on a fresh install) and of
examples/print-studio-config-example.json. Only id, name, zpl, the label
size and the design are taken; nothing else from the export (API key, pasted data, audit
log, column memory) is copied. Users' own saved templates are not touched.
"""
import json
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = json.load(open(sys.argv[1], encoding="utf-8"))
keys = ("id", "name", "zpl", "labelWidth", "labelHeight", "labelDpmm", "design")
templates = [{k: t[k] for k in keys if k in t} for t in src.get("templates", [])]
if not templates:
    sys.exit("no templates in " + sys.argv[1])

# PRINTStudio.html: DEFAULTS is a JSON object literal ending at the first "\n};\n".
path = os.path.join(root, "PRINTStudio.html")
s = open(path, encoding="utf-8").read()
start = s.index("const DEFAULTS = {")
end = s.index("\n};\n", start) + 2
defaults = json.loads(s[start + len("const DEFAULTS = "):end])
ids = {t["id"] for t in templates}
defaults["templates"] = templates
# Template references in the defaults must still point to existing templates.
first = templates[0]["id"]
lu = defaults.get("lastUsed", {})
if lu.get("template") not in ids:
    lu["template"] = first
for m in (lu.get("byMode") or {}).values():
    if m.get("template") and m["template"] not in ids:
        m["template"] = first
for b in defaults.get("bundles", []):
    if b.get("templateId") and b["templateId"] not in ids:
        b["templateId"] = first
block = json.dumps(defaults, indent=2, ensure_ascii=False)
s = s[:start] + "const DEFAULTS = " + block + s[end:]
open(path, "w", encoding="utf-8").write(s)

ex_path = os.path.join(root, "examples", "print-studio-config-example.json")
ex = json.load(open(ex_path, encoding="utf-8"))
ex["templates"] = templates
json.dump(ex, open(ex_path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
print(f"{len(templates)} default templates set: " + ", ".join(t["name"] for t in templates))
