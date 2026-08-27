import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('GitHub Pages entry uses student ID lookup instead of room/name selectors', async () => {
  const html = await read('index.html');
  assert.match(html, /APP_SCRIPT_URL/);
  assert.match(html, /id="studentIdInput"/);
  assert.match(html, /id="searchStudentBtn"/);
  assert.match(html, /action=student/);
  assert.match(html, /id="studentName"/);
  assert.match(html, /id="studentClass"/);
  assert.match(html, /id="studentNo"/);
  assert.doesNotMatch(html, /id="studentSelect"/);
  assert.doesNotMatch(html, /<select id="studentClass"/);
  assert.match(html, /target="sheetFrame"/);
  assert.doesNotMatch(html, /\/api\/students/);
  assert.doesNotMatch(html, /\/api\/submit/);
});

test('every question includes a required written reason', async () => {
  const html = await read('index.html');
  assert.match(html, /class="reason-input"/);
  assert.match(html, /name="reason\$\{q\.id\}"/);
  assert.match(html, /เหตุผลของฉัน/);
  assert.match(html, /function reasonsObject/);
  assert.match(html, /กรุณาพิมพ์เหตุผลให้ครบทั้ง 20 ข้อ/);
  assert.match(html, /reasons/);
});

test('page keeps colorful mobile-first visual treatment', async () => {
  const html = await read('index.html');
  assert.match(html, /theme-color" content="#6d28d9"/);
  assert.match(html, /linear-gradient/);
  assert.match(html, /class="hero-badges"/);
  assert.match(html, /viewport-fit=cover/);
});

test('Cloudflare config is removed from package scripts', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.scripts?.dev, undefined);
  assert.equal(pkg.scripts?.deploy, undefined);
  assert.equal(pkg.devDependencies?.wrangler, undefined);
});

test('Apps Script supports JSONP lookup and iframe form submission', async () => {
  const code = await read('apps-script/Code.gs');
  assert.match(code, /MimeType\.JAVASCRIPT/);
  assert.match(code, /e\.parameter\.payload/);
  assert.match(code, /postMessage/);
  assert.match(code, /XFrameOptionsMode\.ALLOWALL/);
});