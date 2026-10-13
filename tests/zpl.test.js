// Unit tests for the ZPL substitution and the copy limits: node tests/zpl.test.js
// The functions are read straight from index.html, so the test always checks the app's code.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const fn = name => { const i = html.indexOf(`function ${name}(`); return html.slice(i, html.indexOf('\n}\n', i) + 3); };
const { subst, labelCopies, apiCopies, printChunks, labelRanges } = new Function(
  'const PQ_MAX_PER_LABEL = 10, COPIES_PER_REQUEST = 100;\n' +
  ['subst', 'labelCopies', 'apiCopies', 'printChunks', 'labelRanges'].map(fn).join('\n') +
  '\nreturn { subst, labelCopies, apiCopies, printChunks, labelRanges };')();
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
