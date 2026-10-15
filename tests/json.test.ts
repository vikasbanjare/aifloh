import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeJson } from '../src/lib/json.ts';

test('safeJson cannot close a script tag', () => {
  const out = safeJson({ t: '</script><script>alert(1)</script>', a: 'a & b' });
  assert.ok(!out.includes('<') && !out.includes('>') && !out.includes('&'));
  assert.deepEqual(JSON.parse(out), { t: '</script><script>alert(1)</script>', a: 'a & b' });
});
