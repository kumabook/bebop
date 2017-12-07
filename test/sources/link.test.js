import test from 'ava';
import { getFaviconUrl } from '../../src/utils/url';
import { faviconUrl, getLabel } from '../../src/sources/link';

test('faviconUrl returns url', (t) => {
  const url = 'https://example.com';
  const clickImage = 'moz-extension://extension-id/images/click.png';
  t.is(faviconUrl({ role: 'link', url }), getFaviconUrl(url));
  t.is(faviconUrl({ role: 'button', url }), clickImage);
});

test('getLabel returns label', (t) => {
  const url = 'https://example.com';
  const label = 'label';
  t.is(getLabel({ url, label }), `${label}: ${url}`);
  t.is(getLabel({ url, label: ' ' }), url);
  t.is(getLabel({ label }), label);
});
