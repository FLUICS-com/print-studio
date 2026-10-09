#!/usr/bin/env python3
"""Build the FLUICS-branded PDF of the PRINT Studio user manual.

Usage:
    python3 build_manual_pdf.py "PRINT Studio v10 Manual.md"

Writes "<manual name>.pdf" next to the Markdown file. Needs the `markdown`
package and Google Chrome (headless print to PDF). Fonts (Hind) and the logo
come from the fluics-brand skill assets; set FLUICS_BRAND_ASSETS to point
elsewhere. The intermediate HTML is built in a temporary folder.
"""
import datetime
import glob
import os
import re
import shutil
import subprocess
import sys
import tempfile

import markdown

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ASSETS = os.environ.get("FLUICS_BRAND_ASSETS") or next(iter(sorted(glob.glob(os.path.expanduser(
    "~/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/*/*/skills/fluics-brand/assets")))), "")

CSS = """
@font-face { font-family: Hind; src: url("Hind-Light.otf") format("opentype"); font-weight: 300; }
@font-face { font-family: Hind; src: url("Hind-Regular.otf") format("opentype"); font-weight: 400; }
@font-face { font-family: Hind; src: url("Hind-Medium.otf") format("opentype"); font-weight: 500; }
@font-face { font-family: Hind; src: url("Hind-SemiBold.otf") format("opentype"); font-weight: 600; }
@page { size: A4; margin: 18mm 18mm 20mm 18mm; }
body { font-family: Hind, Helvetica, Arial, sans-serif; font-weight: 400; color: #716C6A; font-size: 10.2pt; line-height: 1.5; margin: 0; text-align: left; }
h1, h2, h3, h4 { color: #363332; font-weight: 600; line-height: 1.25; break-after: avoid; }
.cover { height: 245mm; display: flex; flex-direction: column; justify-content: space-between; break-after: page; }
.cover .bar { height: 6mm; width: 40mm; background: #FFE000; margin-bottom: 8mm; }
.cover .logo svg { height: 13mm; width: auto; }
.cover h1 { font-size: 30pt; margin: 0 0 3mm; }
.cover .sub { font-size: 13pt; font-weight: 300; }
.cover .meta { font-size: 9pt; line-height: 1.6; }
h2 { font-size: 16pt; margin: 9mm 0 3mm; padding-top: 2mm; border-top: 2.5pt solid #FFE000; }
h3 { font-size: 12.5pt; margin: 6mm 0 2mm; }
h4 { font-size: 10.8pt; margin: 4mm 0 1.5mm; }
p { margin: 0 0 2.5mm; }
ul, ol { margin: 0 0 3mm; padding-left: 5mm; }
li { margin: 0 0 1mm; }
a { color: #00A4CE; text-decoration: none; }
strong { color: #363332; font-weight: 600; }
em { font-style: normal; color: #363332; font-weight: 500; } /* Hind has no italic; avoid an Arial fallback */
code { font-family: Menlo, Consolas, monospace; font-size: 8.6pt; background: #F5F5F5; padding: 0.2mm 1mm; border-radius: 1mm; color: #363332; }
table { border-collapse: collapse; width: 100%; margin: 2mm 0 4mm; font-size: 9.2pt; break-inside: avoid; }
th { text-align: left; color: #363332; font-weight: 600; background: #F5F5F5; }
th, td { border: 0.4pt solid #ddd; padding: 1.5mm 2.2mm; vertical-align: top; }
.toc { break-after: page; }
.toc ol { list-style: none; padding: 0; }
.toc li { margin: 0 0 1.6mm; color: #363332; }
"""


def main(md_path):
    if not ASSETS or not os.path.isdir(ASSETS):
        sys.exit("fluics-brand assets not found; set FLUICS_BRAND_ASSETS")
    md = open(md_path, encoding="utf-8").read()
    first, rest = md.split("\n", 1)
    version = re.search(r"v(\d+\.\d+)", first)
    body = markdown.markdown(rest, extensions=["tables"])
    heads = [re.sub("<[^>]+>", "", h) for h in re.findall(r"<h2>(.*?)</h2>", body)]
    toc = '<section class="toc"><h2>Contents</h2><ol>' + "".join(f"<li>{h}</li>" for h in heads) + "</ol></section>"
    logo = open(os.path.join(ASSETS, "fluics-logo.svg"), encoding="utf-8").read()
    status = datetime.date.today().strftime("%d %B %Y")
    html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>FLUICS PRINT Studio user manual</title><style>{CSS}</style></head><body>
<section class="cover">
  <div class="logo">{logo}</div>
  <div><div class="bar"></div><h1>FLUICS PRINT Studio</h1>
  <div class="sub">User manual{', version ' + version.group(1) if version else ''}</div></div>
  <div class="meta">FLUICS GmbH · Fürstenstr. 15 · 80333 München · Germany<br>support@fluics.com · www.fluics.com<br>Status: {status}</div>
</section>
{toc}
{body}
</body></html>"""
    out_pdf = os.path.splitext(md_path)[0] + ".pdf"
    with tempfile.TemporaryDirectory() as tmp:
        for f in glob.glob(os.path.join(ASSETS, "fonts", "Hind-*.otf")):
            shutil.copy(f, tmp)
        page = os.path.join(tmp, "manual.html")
        open(page, "w", encoding="utf-8").write(html)
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                        f"--print-to-pdf={os.path.abspath(out_pdf)}", "file://" + page],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("wrote", out_pdf)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "PRINT Studio v10 Manual.md")
