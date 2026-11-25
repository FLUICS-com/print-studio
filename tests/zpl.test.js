// Unit tests for the ZPL substitution and the copy limits: node tests/zpl.test.js
// The functions are read straight from PRINTStudio.html, so the test always checks the app's code.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'PRINTStudio.html'), 'utf8');
const fn = name => { const i = html.indexOf(`function ${name}(`); return html.slice(i, html.indexOf('\n}\n', i) + 3); };
const { subst, withCopies, labelCopies, apiCopies, printChunks, labelRanges } = new Function(
  'const PQ_MAX_PER_LABEL = 10, COPIES_PER_REQUEST = 100;\n' +
  ['designWidth', 'designWrap', 'designBlock', 'subst', 'labelCopies', 'withCopies', 'apiCopies', 'printChunks', 'labelRanges'].map(fn).join('\n') +
  '\nreturn { subst, withCopies, labelCopies, apiCopies, printChunks, labelRanges };')();
const t = (name, f) => { try { f(); console.log('PASS', name); } catch (e) { console.log('FAIL', name, '\n ', e.message); process.exitCode = 1; } };
t('plain value unchanged', () => assert.equal(subst('^FO1,1^FD${A}^FS', { A: 'abc' }), '^FO1,1^FDabc^FS'));
t('caret in field gets ^FH\\ and hex', () => assert.equal(subst('^FO1,1^FD${A}^FS', { A: 'a^b~c\\d' }), '^FO1,1^FH\\^FDa\\5Eb\\7Ec\\5Cd^FS'));
t('static backslash escaped when ^FH added', () => assert.equal(subst('^FDC:\\x ${A}^FS', { A: '^' }), '^FH\\^FDC:\\5Cx \\5E^FS'));
t('existing ^FH_ indicator is used', () => assert.equal(subst('^FO1,1^FH_^FD${A}^FS', { A: 'a_b^c' }), '^FO1,1^FH_^FDa_5Fb_5Ec^FS'));
t('^FH without indicator means _', () => assert.equal(subst('^FH^FD${A}^FS', { A: 'x_y' }), '^FH^FDx_5Fy^FS'));
t('existing ^FH\\ not duplicated', () => assert.equal(subst('^FH\\^FD${A}^FS', { A: '^' }), '^FH\\^FD\\5E^FS'));
t('only the affected field gets ^FH', () => assert.equal(subst('^FD${A}^FS^FD${B}^FS', { A: 'ok', B: '^x' }), '^FDok^FS^FH\\^FD\\5Ex^FS'));
t('token in command param after a field is not hexed', () => {
  const issues = [];
  assert.equal(subst('^FD${A}^FS^PQ${N}', { A: 'x', N: '2' }, issues), '^FDx^FS^PQ2');
  assert.deepEqual(issues, []);
});
t('command param with caret is cleaned and reported', () => {
  const issues = [];
  assert.equal(subst('^FDa^FS^PQ${N}', { N: '1^PQ99' }, issues), '^FDa^FS^PQ1PQ99');
  assert.equal(issues.length, 1);
});
t('^FV treated as field data', () => assert.equal(subst('^FV${A}^FS', { A: '~' }), '^FH\\^FV\\7E^FS'));
t('lowercase ^fd recognised', () => assert.equal(subst('^fd${A}^fs', { A: '^' }), '^FH\\^fd\\5E^fs'));
t('field without ^FS at end', () => assert.equal(subst('^FD${A}', { A: '^' }), '^FH\\^FD\\5E'));
t('missing token becomes empty', () => assert.equal(subst('^FD${X}^FS', {}), '^FD^FS'));
t('labelCopies', () => { assert.equal(labelCopies('^FDa^FS'), 1); assert.equal(labelCopies('^PQ3^FD^FS^PQ7,0,1,Y'), 7); });
t('apiCopies mirrors the server (PQ7,0,1,Y counts 1)', () => { assert.equal(apiCopies('^PQ7'), 7); assert.equal(apiCopies('^PQ7,0,1,Y'), 1); });
t('chunks respect 100 copies', () => {
  const p = Array.from({ length: 120 }, (_, i) => ({ id: 'i' + i, data: '^FD^FS^PQ2' }));
  const c = printChunks(p);
  assert.deepEqual(c.map(x => x.length), [50, 50, 20]);
});
t('chunks respect 100 labels', () => assert.deepEqual(printChunks(Array.from({ length: 230 }, (_, i) => ({ id: i, data: '' }))).map(x => x.length), [100, 100, 30]));
t('labelRanges', () => assert.equal(labelRanges([0, 1, 2, 5, 7, 8]), '1-3, 6, 8-9'));
// ^BQ field data starts with error correction, input mode and a comma (LA,); without it the first 3 characters are lost.
const qrFields = z => [...z.matchAll(/\^BQ[^^]*\^FD(.*?)\^FS/g)].map(m => m[1]);
const checkQr = (src, templates) => t(`QR fields in ${src} have the LA, prefix`, () => {
  const fields = templates.flatMap(x => qrFields(x.zpl));
  assert.ok(fields.length >= 3);
  fields.forEach(f => assert.match(f, /^[HQML][AM],/));
});
checkQr('the default templates', [...html.matchAll(/^\s*"zpl": (".*"),$/gm)].map(m => ({ zpl: JSON.parse(m[1]) })));
checkQr('the example config', JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'examples', 'print-studio-config-example.json'), 'utf8')).templates);
// Label designer: design → ZPL
const { sanitizeDesign, designZpl } = new Function(['sanitizeDesign', 'designWidth', 'designField', 'designZpl'].map(fn).join('\n') + '\nreturn { sanitizeDesign, designZpl };')();
const design = (...elements) => sanitizeDesign({ v: 1, w: 300, h: 150, margin: 20, elements, samples: { NAME: 'x' } });
const last = d => designZpl(d).split('\n').pop();
t('designer: text', () => assert.equal(last(design({ type: 'text', x: 10, y: 20, data: 'a ${NAME}', size: 25 })), '^FO10,20^A0N,25^FDa ${NAME}^FS'));
t('designer: QR has LA, and the 10 dot offset', () => assert.equal(last(design({ type: 'qr', x: 0, y: 10, data: '${NAME}', size: 4 })), '^FO0,0^BY2,3,10^BQN,2,4^FDLA,${NAME}^FS'));
t('designer: DataMatrix and Code 128', () => {
  assert.equal(last(design({ type: 'dm', x: 0, y: 0, data: 'A', size: 5 })), '^FO0,0^BXN,5,200,,,,`^FDA^FS');
  assert.equal(last(design({ type: 'c128', x: 0, y: 0, data: 'A', size: 2, height: 40, rot: 'R' })), '^FO0,0^BY2^BCR,40,N,N,N,A^FDA^FS');
});
t('designer: static ^ and ~ never become commands', () => assert.equal(last(design({ type: 'text', x: 0, y: 0, data: 'a^XZ~_${NAME}', size: 25 })), '^FO0,0^A0N,25^FH_^FDa_5EXZ_7E_5F${NAME}^FS'));
t('designer: values are escaped by subst', () => assert.equal(subst(last(design({ type: 'text', x: 0, y: 0, data: '${NAME}', size: 25 })), { NAME: '^XZ' }), '^FO0,0^A0N,25^FH\\^FD\\5EXZ^FS'));
t('designer: block newline', () => assert.equal(last(design({ type: 'text', x: 0, y: 0, data: 'a\nb', size: 25, block: 100, lines: 2 })), '^FO0,0^A0N,25^FB100,2,0,L^FH_^FDa\\&b^FS'));
t('designer: imported junk is dropped', () => {
  const d = design({ type: 'text', x: '9^XZ', y: 1e9, data: 5, size: 'x', rot: '^', evil: 1 }, { type: 'zpl' }, null);
  assert.equal(d.elements.length, 1);
  assert.deepEqual([d.elements[0].x, d.elements[0].y, d.elements[0].size, d.elements[0].rot, d.elements[0].evil], [0, 4000, 25, 'N', undefined]);
  assert.equal(sanitizeDesign({ v: 2, elements: [] }), null);
});
t('designer: sanitizing twice gives the same ZPL', () => { const d = design({ type: 'qr', x: 0, y: 10, data: 'a', size: 4 }); assert.equal(designZpl(sanitizeDesign(d)), designZpl(d)); });
const blockDesign = (data, o = {}) => designZpl(design({ type: 'text', x: 0, y: 0, data, size: 71, block: 154, lines: 2, ...o }));
const printedZpl = (z, v, issues) => subst(z, v, issues).split('\n').slice(7).join('\n');
const printed = (z, v, issues) => printedZpl(z, v, issues).split('^FS').map(p => p.split('^FD')[1]).filter(p => p !== undefined).join('|');
t('designer: the template keeps the text unbroken', () => assert.ok(blockDesign('ROLLLI').endsWith('^FB154,2,0,L^FH_^FDROLLLI^FS')));
t('designer: fixed text is broken at print time', () => assert.equal(printed(blockDesign('ROLLLI'), {}), 'ROL|LLI'));
t('designer: placeholder value is broken at print time', () => assert.equal(printed(blockDesign('${NAME}'), { NAME: 'ROLLLI' }), 'ROL|LLI'));
t('designer: breaks at spaces and at line breaks first', () => {
  assert.equal(printed(blockDesign('one two three', { size: 30, block: 100, lines: 3 }), {}), 'one two|three');
  assert.equal(printed(blockDesign('a\n${NAME}', { size: 30 }), { NAME: 'b' }), 'a|b');
});
t('designer: special characters in a block survive, commands never do', () => assert.equal(printed(blockDesign('a_${NAME}', { size: 10, block: 260 }), { NAME: '^XZ~_\\&' }), 'a_5F_5EXZ_7E_5F\\&'));
t('designer: too many lines are reported', () => {
  const issues = [];
  printed(blockDesign('${NAME}'), { NAME: 'ROLLLIROLLLI' }, issues);
  assert.equal(issues.length, 1); assert.match(issues[0], /lines/);
});
t('only designer templates are wrapped', () => assert.equal(subst('^FO0,0^A0N,71^FB154,2,0,L^FH_^FD${NAME}^FS', { NAME: 'ROLLLI' }), '^FO0,0^A0N,71^FB154,2,0,L^FH_^FDROLLLI^FS'));
t('designer: wide lines leave room (hyphens and digits are wide in ^A0)', () => {
  const lines = printed(blockDesign('${NAME}', { size: 24, block: 130, lines: 9 }), { NAME: 'Wide-WWWWW_mmm/iiiilll.0123456789' }).split('|');
  assert.ok(lines.length >= 4, lines.join('|'));
});
t('designer: the printed block has no ^FB and no line break command', () => {
  assert.equal(printedZpl(blockDesign('${NAME}'), { NAME: 'ROLLLI' }), '^FO0,0^A0N,71^FDROL^FS\n^FO0,71^A0N,71^FDLLI^FS');
});
t('designer: text after a block is not affected', () => {
  const z = designZpl(design({ type: 'text', x: 0, y: 0, data: '${A}', size: 71, block: 154, lines: 2 }, { type: 'qr', x: 160, y: 10, data: '${A}', size: 4 }));
  assert.ok(subst(z, { A: 'ROLLLI' }).endsWith('^FDLLI^FS\n^FO160,0^BY2,3,10^BQN,2,4^FDLA,ROLLLI^FS'));
});
t('designer: a hand-edited block (no ^FH_, double ^CI28) is printed without ^FB', () => {
  const z = '^FX PRINT Studio designer ^FS\n^MTT^MUD,300,300\n^PR2\n^MD30\n^PW300\n^LH20,20\n^CI28\n^CI28\n^FO0,0^A0N,50^FB108,2,0,L^FD${NAME}^FS\n^FO164,0^BY2,3,10^BQN,2,4^FDLA,${barcode}^FS';
  assert.equal(subst(z, { NAME: 'ROLLLI', barcode: 'gggggg' }), '^FX PRINT Studio designer ^FS\n^MTT^MUD,300,300\n^PR2\n^MD30\n^PW300\n^LH20,20\n^CI28\n^CI28\n^FO0,0^A0N,50^FDROL^FS\n^FO0,50^A0N,50^FDLLI^FS\n^FO164,0^BY2,3,10^BQN,2,4^FDLA,gggggg^FS');
});
t('designer: other orders, font width, line spacing; ^FR is left alone', () => {
  const p = '^FX PRINT Studio designer ^FS';
  assert.equal(subst(p + '\n^FB108,2,5^FO1,2\n^A0N,50,50^FH\\^FD${A}^FS', { A: 'ROLLLI' }), p + '\n^FO1,2^A0N,50,50^FDROL^FS\n^FO1,57^A0N,50,50^FDLLI^FS');
  assert.ok(subst(p + '^FO1,2^FR^A0N,50^FB108,2^FD${A}^FS', { A: 'ROLLLI' }).includes('^FB108,2'));
});
const { stripZplWrapper, zplWarnings } = new Function(['stripZplWrapper', 'zplWarnings'].map(fn).join('\n') + '\nreturn { stripZplWrapper, zplWarnings };')();
t('pasted ZPL: one ^XA ^XZ is removed, several labels are kept and reported', () => {
  assert.equal(stripZplWrapper('\n^XA\n^FO1,1^FDa^FS\n^XZ\n'), '^FO1,1^FDa^FS');
  assert.equal(stripZplWrapper('^FO1,1^FDa^FS'), '^FO1,1^FDa^FS');
  const two = '^XA^FDa^FS^XZ^XA^FDb^FS^XZ';
  assert.equal(stripZplWrapper(two), two);
  assert.match(zplWarnings(two)[0], /more than one label/);
});
t('pasted ZPL: printer changing commands are named', () => {
  assert.match(zplWarnings('^XA^FDa^FS^JUS~JR^XZ')[0], /\^JUS, ~JR/);
  assert.deepEqual(zplWarnings('^XA^FO1,1^FDa^FS^XZ'), []);
});
t('designer: empty lines at the end of a block do not count', () => {
  const issues = [];
  assert.equal(printed(blockDesign('a\nb\n\n', { size: 30 }), {}, issues), 'a|b');
  assert.deepEqual(issues, []);
});
t('default templates with a design match their ZPL, in app and example config', () => {
  const i = html.indexOf('const DEFAULTS = ') + 17;
  const defs = JSON.parse(html.slice(i, html.indexOf('\n};\n', i) + 2)).templates;
  const ex = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'examples', 'print-studio-config-example.json'), 'utf8')).templates;
  assert.deepEqual(defs, ex);
  assert.equal(defs.filter(x => x.design).length, 4);
  defs.filter(x => x.design).forEach(x => assert.equal(designZpl(sanitizeDesign(x.design)), x.zpl));
});
t('identical labels: ^PQ is set once and counted like the API does', () => {
  assert.equal(withCopies('^FO1,1^FDa^FS\n', 4), '^FO1,1^FDa^FS\n^PQ4');
  const z = withCopies('^PQ6,0,1,Y\n^FDa^FS^PQ2', 3);
  assert.equal(z, '\n^FDa^FS\n^PQ3');
  assert.equal(labelCopies(z), 3); assert.equal(apiCopies(z), 3);
});
t('designer: positions count from the label edge, the first form is still recognised', () => {
  const d = design({ type: 'text', x: 25, y: 30, data: 'a', size: 25 }, { type: 'qr', x: 20, y: 35, data: 'b', size: 4 });
  const now = designZpl(d).split('\n'), old = designZpl(d, true).split('\n');
  assert.deepEqual([now[5], now[7], now[8].slice(0, 7)], ['^LH0,0', '^FO25,30^A0N,25^FDa^FS', '^FO20,2']);
  assert.deepEqual([old[5], old[7], old[8].slice(0, 6)], ['^LH20,20', '^FO5,10^A0N,25^FDa^FS', '^FO0,5']);
});
t('designer: words that are too long break after a hyphen first', () => {
  const b = (data, o) => printed(blockDesign(data, { size: 26, block: 90, lines: 9, ...o }), {});
  assert.equal(b('ABC-123'), 'ABC-|123');
  assert.equal(b('AB-12-34-56'), 'AB-|12-|34-56');
  assert.equal(b('A-1 B-2', { block: 100 }), 'A-1|B-2');                 // fits on its own line: kept whole
  assert.equal(b('A-ABCDEFGHIJ'), 'A-|ABCDEF|GHIJ');
  assert.equal(b('- x'), '- x'); assert.equal(b(''), '');
});
