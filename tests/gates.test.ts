// Step 2 Done-when: npm run check fails with a clear message for each broken rule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const root = mkdtempSync(join(tmpdir(), 'aifloh-gates-'));
mkdirSync(join(root, 'content', 'resources'), { recursive: true });
process.chdir(root);
const { loadContent } = await import('../src/lib/content.ts');
const { blocklistHits } = await import('../src/lib/rules.ts');

function resource(file: string, fields: Record<string, string>) {
  const base: Record<string, string> = {
    slug: 'ok-one', title: 'T', summary: 'S', type: 'guide', intent: 'learn', codeWord: 'word', status: 'live', date: '2026-10-01', publish: 'true', body: 'x',
  };
  const fm = Object.entries({ ...base, ...fields }).map(([k, v]) => `${k}: ${v}`).join('\n');
  writeFileSync(join(root, 'content', 'resources', file), `---\n${fm}\n---\n`);
}
function reset() {
  rmSync(join(root, 'content', 'resources'), { recursive: true, force: true });
  mkdirSync(join(root, 'content', 'resources'), { recursive: true });
}
const errors = () => loadContent({ fresh: true }).errors.join('\n');

test('a valid resource passes and publishes', () => {
  reset();
  resource('a.md', {});
  const c = loadContent({ fresh: true });
  assert.equal(c.errors.length, 0);
  assert.equal(c.resources.length, 1);
});

test('duplicate code word', () => {
  reset();
  resource('a.md', { slug: 'one' });
  resource('b.md', { slug: 'two' });
  assert.match(errors(), /code word "word" is already used/);
});

test('reserved word as code word or slug', () => {
  reset();
  resource('a.md', { codeWord: 'free' });
  resource('b.md', { slug: 'about', codeWord: 'other' });
  assert.match(errors(), /reserved word/);
  assert.match(errors(), /slug is a reserved word/);
});

test('bad slug', () => {
  reset();
  resource('a.md', { slug: 'Bad_Slug' });
  assert.match(errors(), /slug must be 1-40 characters/);
});

test('pending approval and unapproved employer work never publish', () => {
  reset();
  resource('a.md', { slug: 'p', codeWord: 'aaa', approval: '{ status: pending }' });
  resource('b.md', { slug: 'e', codeWord: 'bbb', employer: 'true' });
  resource('c.md', { slug: 'ok', codeWord: 'ccc', employer: 'true', approval: '{ status: approved, by: Someone, on: 2026-10-01 }' });
  const c = loadContent({ fresh: true });
  assert.deepEqual(c.resources.map((r) => r.slug), ['ok']);
});

test('remote image is refused', () => {
  reset();
  resource('a.md', { cover: '{ src: "https://example.com/x.png", alt: a, w: 1, h: 1 }' });
  assert.match(errors(), /remote image URLs are not allowed/);
});

test('openInClaude with a long prompt is refused', () => {
  reset();
  resource('a.md', { openInClaude: 'true', body: 'x'.repeat(2100) });
  assert.match(errors(), /openInClaude is only allowed/);
});

test('future tested date is refused', () => {
  reset();
  resource('a.md', { tested: '{ on: 2099-01-01, tool: Claude, version: "1" }' });
  assert.match(errors(), /tested date is in the future/);
});

test('BLOCKLIST matching is case-insensitive', () => {
  assert.deepEqual(blocklistHits('Made for ACME Corp', ['acme corp']), ['acme corp']);
  assert.deepEqual(blocklistHits('nothing here', ['acme corp']), []);
});
