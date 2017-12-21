import test from 'ava';
import nisemono from 'nisemono';
import { getFaviconUrl } from '../../src/utils/url';
import candidates, { faviconUrl, getLabel } from '../../src/sources/link';

const { browser } = global;
const { query, sendMessage } = browser.tabs;
const { sendMessage: sendMessageToRuntime } = browser.runtime;

function setup() {
  browser.tabs.query = nisemono.func();
  nisemono.expects(browser.tabs.query).resolves([{
    id:       'tab-0',
    title:    'title',
    url:      'https://example.com/',
    windowId: 'window-0',
  }]);
  browser.tabs.sendMessage = nisemono.func();
  browser.runtime.sendMessage = nisemono.func();
}

function restore() {
  browser.tabs.query = query;
  browser.tabs.sendMessage = sendMessage;
  browser.runtime.sendMessage = sendMessageToRuntime;
}

test.beforeEach(setup);
test.afterEach(restore);

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

test.serial('candidates returns link candidates', (t) => {
  nisemono.expects(browser.runtime.sendMessage).resolves({ id: 1 });
  nisemono.expects(browser.tabs.sendMessage).resolves([{
    id:    'link-0',
    label: 'title',
    url:   'https://example.com/',
    role:  'link',
  }]);
  return candidates('q').then(({ items, label }) => {
    t.true(label !== null);
    t.is(items.length, 1);
    t.is(items[0].id, 'link-0');
  });
});

test.serial('candidates returns link candidates', (t) => {
  nisemono.expects(browser.tabs.sendMessage).rejects(new Error('error'));
  nisemono.expects(browser.runtime.sendMessage).rejects(new Error('error'));
  return candidates('q').then(({ items, label }) => {
    t.true(label !== null);
    t.is(items.length, 0);
  });
});
