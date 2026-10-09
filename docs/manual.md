# FLUICS PRINT Studio v1.0: User Manual

PRINT Studio is a single HTML file that runs in your browser and sends label print jobs to FLUICS online label printers. Nothing is installed and no data is stored on a server: the configuration, the pasted data and the audit log live in your browser's local storage. Only the finished label content is sent to the printer through the FLUICS PRINT cloud API.

PRINT Studio is open source under the MIT License. Source code and the latest version are at https://github.com/FLUICS-com/print-studio; the complete FLUICS PRINT API documentation (Swagger) is at https://printers.fluics.com/fluics/printapi-docs/prod/. The software is provided as is and used under your own responsibility: check every label in the preview before printing.

## 1. Requirements

- A current browser (Chrome, Edge, Firefox or Safari). The app runs from the file itself (double-click `PRINT Studio v10.html`), from any web server, and on phones or tablets via a server URL (see Installation below).
- A FLUICS PRINT API key. Request one at connect@fluics.com.
- Internet access for printing, for the visual label preview (Labelary) and for the first load of the Excel reader. Copy and paste and CSV files also work offline.

## 2. Installation and first start

The app is one file with no server-side code. Three ways to run it:

- **Locally on a computer**: keep `PRINT Studio v10.html` in a folder and open it with a double-click. Configuration and audit log stay in that browser.
- **On a server**: upload the file to any web space (static hosting, Apache, nginx, a PHP hosting package: no PHP needed), then open its URL. Everyone opening the URL still keeps their own configuration in their own browser; share a configuration file to align them. HTTPS is recommended (needed for the barcode scanner).
- **On a phone or tablet**: open the server URL in the mobile browser and add it to the home screen. The layout adapts to narrow screens; the preview shows a Table / Visual toggle.

First start:

1. Open the HTML file. The book icon (top right) opens this manual, the gear icon opens the settings; the version number is in the footer.
2. As long as no API key is stored, the printer field under 1 shows a link *No printer connected* that opens the right place: the gear icon, section **Connect printer**. Enter your API key there; it is masked, the eye icon shows it. The field is deliberately not a browser password field, so no browser offers to save the key as a password. Leave the base URL unchanged unless FLUICS told you otherwise. Click **Save and load printers**. Under **General**, pick your date format and whether label sizes are shown in inches or millimetres.
3. Check the **Label templates** section. A fresh installation already contains the FLUICS demo setup: the templates *Type 1 Labels (text only)*, *Type 1 Labels (qr code)*, *Type 4 Labels (qr code)* and *Type 12 Labels (circle+rectangle)*, plus two example bundles. Matching labels and ribbons are at https://fluics.com/labels.
4. If you received a configuration file (`fluics-print-studio-config-….json`), import it in the **General** section → Import. Everything (templates, placeholders, bundles, printers, audit log) is restored.

## 3. Printing

The four cards below the header (Single Print, Paste to Print, Batch Print, Label Bundles) are the four ways to define what gets printed; the highlighted card is the active one. All of them start with section **1 Label template and printer** (choose the template first, its placeholders drive everything below, then the printer), and end with the preview and the Print button. Template and printer are remembered **separately for each mode**, so Single Print can use a different label and printer than Batch Print; in Label Bundles every bundle has its own template.

| Mode | Use it when | One label per |
|---|---|---|
| **Single Print** | You need one label right now | The one label |
| **Paste to Print** | The data already exists in Excel or a CSV file | Row of the table (× copies) |
| **Batch Print** | You print several labels with the same content, optionally with a running number | Label (1…N) |
| **Label Bundles** | A fixed set of labels that share their content and differ in one field | Label type × its count |

Click a card to switch. A fresh installation opens in Batch Print; afterwards the last used mode is remembered.

### 3.1 Single Print

The quickest way to one label: 1 Label template and printer, 2 Label content (one row per placeholder of the template, text or date), 3 Preview, then **Print label** or **Save as PDF**. Values are remembered.

### 3.2 Paste to Print

Paste to Print prints one label per row of a table. The screen is numbered: 1 Label template and printer, 2 Data, 3 Columns and rows, 4 Preview. The **Edit label templates** links open the template editor whenever a placeholder is missing.

#### Section 2: Data

Either

- select the cells in Excel (including the header row), copy them, click into the text box and paste (Ctrl+V / Cmd+V). The data is read immediately. Tab, semicolon and comma separated text is recognised automatically, or
- click **Upload .xlsx / .csv** and pick a file. For Excel files with several sheets, a sheet selector appears next to the data summary. Date cells are converted to dates automatically, or
- click **Enter manually** to start with an empty table: one column per placeholder of the selected template and the number of rows you enter. Type the values directly into the grid.

Leave **First row contains column names** ticked when your first row is a header. Untick it if the data starts immediately; the columns are then called Column A, B, C.

After loading, the box shows the source (Clipboard or file name), the number of rows and columns, and the buttons **Load other data** and **Clear**.

#### Section 3: Columns and rows

This is the table that will be printed. Two things happen here:

**Column mapping.** Above every column there is a dropdown listing the **placeholders of the selected label template**, for example `${PRODUCT_NAME}`, `${BATCH_ID}`, `${DATE}`. Pick the placeholder the column fills. Placeholders of your other templates are listed as *(not in selected label template)*. Columns whose header matches a placeholder or a variable name (in English or German, for example Produkt, Charge, Test, Datum, Name) are mapped automatically; check the result and correct it where needed. Mapped columns are shown with a blue header, ignored columns are grey. Each placeholder can be taken from one column only. The **Edit label templates** link opens the template editor if a placeholder is missing.

The line above the grid lists every placeholder of the template and where it comes from, for example *${PRODUCT_NAME} ← column "Produkt" · ${USER} ← empty*. Read it before printing. Every placeholder that has no column yet shows a **+ add column** button: it asks for one value (for example the user name, or today's date) and adds a column filled with that value in every row. Change single cells afterwards if needed.

The last entry in the dropdown is **Copies: print row N times**: the number in the cell is the number of labels for that row. The running number 1…N is written into the counter placeholder (Sample #) unless that placeholder has a column of its own. A column called Sample Count, Anzahl, Copies or Qty is mapped this way automatically. Without a copies column, every row prints once. If your sheet already lists every sample on its own row, map the sample number column directly to the counter placeholder instead.

**Editing.** Click any cell to change it; the preview updates while you type. Further tools:

- **⤓ (appears when hovering a cell)**: copies that cell's value into all rows below it.
- **Ctrl+D / Cmd+D** in a cell: copies the value from the row above (like Excel). **Enter** moves to the row below.
- **+ Row** adds an empty row at the bottom, **+ Column** adds a new empty column, **×** removes a row or column.

Completely empty rows are skipped when printing.

**Dates.** Dates from Excel date cells and dates typed as YYYY-MM-DD are printed in the date format set under Settings, General. Any other text (for example 21.04.2026 typed into a cell) is printed as it is.

The pasted table and the mapping are kept when you close the browser, so you can continue later.

### 3.3 Batch Print

Batch Print prints **Number of labels** copies of one label (1 Label template and printer, 2 Label content, 3 Preview). The content is defined row by row: the selected template has exactly one row per placeholder, the placeholder name on the left, its value on the right. Each row has a kind:

- **Text**: one value for every label. The camera icon scans a barcode or QR code into the field (needs HTTPS and camera permission).
- **Date**: the box shows the date exactly as it will be printed, in the format set under Settings, General (the **change date format** link leads there). With **Today** ticked (default) the date follows the current date automatically, also when you print tomorrow. Untick it and click the box or the calendar icon to pick a fixed date.
- **Counter**: increases with every label. Set the **Start** number, the number of **Digits** (zero padded) and an optional **Prefix** in the three boxes next to it (on phones below it); the row shows an example such as *#007, #008, …*. The counter placeholder (Sample #) gets this kind automatically.

Values are remembered per placeholder, so switching templates back and forth does not lose them.

### 3.4 Label Bundles

A **bundle** is a set of labels that share the same content and differ in **one field** (the label type) plus a running number. Example: a bundle *Patient sample collection* with 3 serum, 2 plasma and 1 saliva label. You enter the patient ID, date and user once; the bundle produces 6 labels: Serum #1…#3, Plasma #1…#2, Saliva #1. The box **What is a label bundle?** at the top of the page shows this as a diagram of the three sections 2 Bundle, 3 Shared values and 4 Labels in this bundle.

After 1 Label template and printer, the page has three own sections:

**2 Bundle.** Choose a bundle from the dropdown or click **+ New bundle**, and give it a name (for example *Patient sample collection*). **Delete** removes the selected bundle. Everything below (label template, shared values, label types, numbering) is stored with the bundle, so switching bundles switches all of it, including the template under 1.

**3 Shared values.** The values printed on every label of the bundle, stored with the bundle: switching bundles brings back the values you entered for each one. Each row has a **placeholder dropdown** (the placeholders of your templates), a kind (Text or Date, dates as in Batch Print) and the value. When you select a template, one row per remaining placeholder is created; **+ Row** adds one, **×** removes one (a removed row stays removed; the placeholder is then printed empty, which the grey hint below the rows tells you). Placeholders that section 4 fills (label type and numbering) are not offered here.

**4 Labels in this bundle.** One row per label type: the **placeholder** that differs (for example `${TEST_NAME}`), its **value** (Serum) and the **count** (3). **+ Label type** adds a row, **×** removes one; the line below sums it up (*Serum × 3, Plasma × 2, Saliva × 1 → 6 labels*).

**Numbering within each label type** (same section): choose the placeholder that carries the running number (for example `${SAMPLE}`), plus start, digits and prefix. The blue line states that the number **restarts for every label type**, and the range next to each label type row shows what it gets (*#01 … #03*). Choose *No numbering* if the labels of a type should be identical.

Bundles from earlier versions (product groups) are converted: every test becomes a label type row; the product itself is entered as a shared value.

### 3.5 Preview

The preview shows exactly the labels that will be sent, one row per label, after all counters and copies have been expanded. The number of labels is shown at the top right and on the Print button.

On wide screens the rendered label image (Labelary) is shown next to the table; on narrow screens the rendered label is shown first and the **Table / Visual** toggle switches to the table. To keep the number of requests to Labelary low, typing never triggers a render. The image is refreshed once when the page or a print mode is opened, whenever you move on to the next field (click or tab into another input, change a dropdown, a date or a checkbox), and when you click the image itself. Until then the old image is dimmed with the note *Content changed. Click to render*. Use ‹ › to step through the labels (each step renders that label). The image is rendered by the third-party service labelary.com; your label text is sent there for rendering. It can be switched off under Settings, General (the **Preview settings** link below the image leads there); a hint in the preview section then reminds you that rendering is available. The table preview always works.

A yellow warning appears when a template placeholder has no value, for example *${BATCH_ID} (empty in 3 of 25)*. Fix the data or the mapping before printing. More than 100 labels are sent in chunks of 100 automatically.

### 3.6 Printing

Select template and printer, check the preview, click **Print**. The button shows the number of labels. The result is shown below the button and written to the audit log, also when the print fails.
Jobs with more than 500 labels ask for confirmation first, to catch a typo in a number of labels or a Copies cell. Large jobs are sent in chunks of 100. If a later chunk fails (for example the printer goes offline), the message says how many labels were already printed, so you only print the rest again.

Values are printed exactly as entered: characters that ZPL would treat as commands (`^`, `~`, `\`) are escaped automatically, so a value like `A^B` prints as `A^B`.


**Save as PDF** renders the same labels through Labelary and downloads `fluics-print-studio-labels-<date_time>.pdf` with one label per page, at the template's label size. Use it when no printer is connected (the hint next to the buttons says so when no API key is stored), to print on an office printer, or to archive a job. The visual preview must be enabled: if it is off, the button is disabled and a note links to Settings, General. PDF exports are written to the audit log with *PDF file* as printer.

| Message | Meaning | What to do |
|---|---|---|
| Printer did not respond in time | Printer is off, offline or busy (HTTP 408) | Check power, network and paper, then print again |
| Access denied | Wrong or expired API key (403) | Check the key under Connect printer |
| Printer not found | Printer no longer linked to your key (404) | Refresh the printer list, contact FLUICS |
| No API key | No key stored yet | Enter the key under Connect printer |

## 4. Settings (gear icon)

The gear icon opens the settings panel with five sections.

### 4.1 General

- **Date format**: how every date placeholder is printed, in all print modes (for example 2026-04-21, 21.04.2026, 21Apr26).
- **Label dimensions**: whether label width and height are shown and entered in inches or millimetres in the template editor. Templates are stored in inches internally, switching the unit converts the display.
- **Preview**: switches the Labelary rendering on or off (see 3.5).
- **Reset**: **Reset app to factory defaults** removes everything stored in this browser (settings, API key, templates, bundles, entered values, audit log) and starts again with the demo setup. Export first if you want to keep anything. The same effect: delete the site's data in the browser settings (iPhone: Settings, Safari, Advanced, Website Data; Android Chrome: site settings, Clear and reset).
- **Configuration file**: **Export** downloads the complete setup (templates, placeholders, bundles, printer names, settings including the API key, audit log) as a JSON file; **Import** restores it. The selected printer is not part of the file: printers are loaded live from the API whenever the app is used. Rows for placeholders that exist in none of your templates, and rows that still have their default value, are dropped automatically; the `variables` block only names the placeholders with a role (date, counter) and a few legacy names. Use export to back up your setup, to move it to another computer, or to send it to FLUICS support. The file name contains the app version and the local date and time down to the second (`fluics-print-studio-config-v10-2026-09-25_14-05-33.json`), so repeated exports never overwrite each other. Importing replaces everything in the browser, including the audit log, so export the current state first if you want to keep it. The app asks before importing and refuses files that are not a PRINT Studio configuration; if an import fails, the previous configuration is kept.

### 4.2 Connect printer

API key and base URL of the FLUICS PRINT API; **Save and load printers** stores them and fetches the printer list. Below, give each printer a friendly name (for example Laboratory, Office). The name is used in the printer dropdown and in the audit log.

### 4.3 Label templates

**Edit ZPL with care.** The template is sent to the printer as is. Keep the printer settings in the template (`^MT`, `^MD`, `^PR`, `^PW`, `^MU`: media type, darkness, speed, width, units) as delivered with your printer setup; changing them can spoil labels or misalign the printer. Check every change in the preview. Usage is under your own responsibility. If you need a new or adapted template, write to support@fluics.com or order one at https://fluics.com/product/custom-template/. Labels and ribbons for the FLUICS printers: https://fluics.com/labels.

A template is the ZPL code of one label plus its size (width, height, printer resolution). To learn ZPL, the Learning ZPL box at the top of the Label templates section and the template editor link to Labelary's [introduction with examples](https://labelary.com/zpl.html), the [Labelary online viewer](https://labelary.com/viewer.html) to try code, and Zebra's [ZPL programming guide](https://docs.zebra.com/us/en/printers/software/zpl-pg.html) with the complete command reference. Write `${NAME}` where a value should be printed. Below the ZPL editor all placeholders are listed: the ones used in this template first, then the ones used in your other templates; **click a placeholder to insert it at the cursor**. Two names have a built-in role, shown as a small hint on the chip: the date placeholder (*date picker*) opens as a date row and the counter placeholder (*counter*) as a running number. Every placeholder of a saved template is offered in the dropdowns of Single Print, Batch Print, Label Bundles and Paste to Print. The ↑ ↓ buttons on each template card change the order of the templates, which is the order of the template dropdowns.  Do not include `^XA` and `^XZ`, the API adds them. Every template card in the overview shows a rendered image of the template (placeholders printed as `${…}`). The editor renders the layout once when it opens and again when you leave a field you changed (click into another field or anywhere else in the dialog) or click the preview box; while you type, the image is only dimmed.

### 4.4 Notes

A free-text field for ideas and reminders, stored with the configuration.

### 4.5 Audit Log

Every print attempt is recorded with timestamp (local time with UTC offset), printer, template, mode (Batch, Bundle or Paste), bundle name or data source (file name, Clipboard or Manual entry), number of labels, result, error text, app version and the full ZPL of every label. **Export CSV** downloads the log, **Clear** deletes it after confirmation. The log keeps the most recent 500 entries. It is stored **only in this browser on this device, not on the print server**: other devices and browsers keep their own log, and clearing the browser data deletes it. Export it regularly if you need it for documentation. Browsers limit the storage per site (typically about 5 MB); when it is full, the label details (ZPL) of the oldest entries are removed first and a note tells you so.

## 5. Where the data lives

The audit log and the pasted data are stored in the browser's local storage for this file location. Opening the same HTML file from a different folder or in a different browser starts with an empty configuration: use export and import to carry it over.

## 6. Versions and updates

Every release is a separate file (`PRINT Studio v06.html` for version 0.6, `PRINT Studio v10.html` for version 1.0, and so on) with a matching example configuration (`PRINT STUDIO config v10.json`). The version is shown in the footer and is written into every exported configuration (`appVersion`) and into every audit entry. Newer versions read configurations exported from older versions; the settings are converted automatically on import. To update: export your configuration in the old version, open the new file, import the configuration. If both files are opened from the same folder in the same browser, they share the stored settings, so the new version picks them up without an import.

**Version 1.0** (September 2026), the first release:

- Four print modes in the top bar: Single Print, Paste to Print (Excel and CSV import or manual entry with column-to-placeholder mapping, cell editing and fill-down), Batch Print (placeholder rows with text, date or counter values) and Label Bundles (sets of label types × count with shared values and numbering per type).
- Everything is driven by the `${…}` placeholders of the label templates; template and printer are remembered per mode and per bundle.
- Date fields show the printed format, with a calendar picker and an automatic *Today* option.
- Label preview rendered by Labelary on load, when you move on to the next field, or on click; **Save as PDF** without a printer.
- Settings behind the gear icon (General, Connect printer, Label templates with previews, reordering and clickable placeholders, Notes, Audit Log); manual behind the book icon.
- Clean configuration export (API key kept, printers and stale entries left out, file names stamped to the second), factory reset, factory defaults with the FLUICS demo templates and bundles.
- Safe printing: values are escaped for ZPL, partial prints are reported, large jobs need confirmation, full browser storage is handled, and the app also runs from plain-HTTP servers.

## 7. Keyboard shortcuts in the paste grid

| Keys | Action |
|---|---|
| Enter | Move to the same column in the row below |
| Tab / Shift+Tab | Next / previous cell |
| Ctrl+D / Cmd+D | Copy the value from the row above |
| Escape (in a dialog) | Close without saving |

## 8. Troubleshooting

- **Pasted text lands in one column**: the data was copied as plain text without tabs. Copy the cells directly from Excel, or save as CSV and upload.
- **Numbers or dates look different than in Excel**: Excel cell formatting is not transferred. Dates are read as real dates and printed in the configured date format; formatted numbers (for example 1.000,5) are read as plain numbers.
- **Excel file does not load**: the Excel reader is loaded from the internet on first use. Without connection, save the sheet as CSV or paste the cells instead.
- **No image in the preview**: the preview is disabled under Settings, General, the internet connection is blocked, or Labelary's rate limit was reached (the preview then says so; wait a moment and click the label image again). Label sizes entered in millimetres are converted to inches for Labelary automatically.
- **Camera icon does nothing**: barcode scanning needs HTTPS (or localhost) and camera permission.
- **Configuration disappeared**: the browser's site data was cleared, or the file was opened from a different location. Import your last export.

FLUICS GmbH · Fürstenstr. 15 · 80333 München · connect@fluics.com · https://fluics.com
