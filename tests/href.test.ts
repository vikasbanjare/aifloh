import { test } from 'node:test';
import assert from 'node:assert/strict';
import { joinBase } from '../src/lib/href.ts';

test('root base', () => {
  assert.equal(joinBase('/', '/'), '/');
  assert.equal(joinBase('/', '/free'), '/free');
  assert.equal(joinBase('/', 'free/a-slug'), '/free/a-slug');
});

test('sub-path base, with or without trailing slash', () => {
  assert.equal(joinBase('/aifloh/', '/free'), '/aifloh/free');
  assert.equal(joinBase('/aifloh', '/free'), '/aifloh/free');
  assert.equal(joinBase('/aifloh-site/', '/'), '/aifloh-site/');
  assert.equal(joinBase('/aifloh/', '/fonts/x.woff2'), '/aifloh/fonts/x.woff2');
});
