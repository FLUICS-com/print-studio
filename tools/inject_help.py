#!/usr/bin/env python3
"""Copy docs/manual.md into the built-in Help (#help-content) of PRINTStudio.html.

Usage: python3 tools/inject_help.py   (needs the `markdown` package)
Headings: # -> h2 (styled title), ## -> h3, ### stays h3; links open in a new tab.
"""
import os
import re

import markdown

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
md = open(os.path.join(root, "docs", "manual.md"), encoding="utf-8").read()
html = markdown.markdown(md, extensions=["tables"])
html = re.sub(r"<(/?)h2>", r"<\1h3>", html)
html = re.sub(r"<h1>(.*?)</h1>", r'<h2 class="text-base font-semibold text-gray-900 mb-2">\1</h2>', html)
html = re.sub(r'<a href="', '<a target="_blank" class="text-blue-600 underline" href="', html)
path = os.path.join(root, "PRINTStudio.html")
s = open(path, encoding="utf-8").read()
start_tag = '<div class="help overflow-auto px-6 py-5" id="help-content">\n'
i = s.index(start_tag) + len(start_tag)
j = s.index("\n      </div>", i)
open(path, "w", encoding="utf-8").write(s[:i] + html + s[j:])
print("injected", len(html), "chars")
