import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const code = fs.readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8');

test('Apps Script saves answers dynamically up to payload.total', () => {
  assert.match(code, /i\s*<=\s*Number\(payload\.total\)/);
});
