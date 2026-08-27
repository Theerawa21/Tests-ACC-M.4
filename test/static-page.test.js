import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('GitHub Pages entry exists and uses Google Apps Script directly', async () => {
  const html = await read('index.html');
  assert.match(html, /GitHub Pages \+ Google Sheet/);
  assert.match(html, /APP_SCRIPT_URL/);
  assert.match(html, /studentSelect/);
  assert.match(html, /target="sheetFrame"/);
  assert.doesNotMatch(html, /\/api\/students/);
  assert.doesNotMatch(html, /\/api\/submit/);
});

test('Cloudflare config is removed from package scripts', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.scripts?.dev, undefined);
  assert.equal(pkg.scripts?.deploy, undefined);
  assert.equal(pkg.devDependencies?.wrangler, undefined);
});

test('Apps Script supports JSONP roster and iframe form submission', async () => {
  const code = await read('apps-script/Code.gs');
  assert.match(code, /MimeType\.JAVASCRIPT/);
  assert.match(code, /e\.parameter\.payload/);
  assert.match(code, /postMessage/);
  assert.match(code, /XFrameOptionsMode\.ALLOWALL/);
});
