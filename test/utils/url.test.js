import test from 'ava';
import nisemono from 'nisemono';
import { init, extractDomain, getFaviconUrl } from '../../src/utils/url';

const validUrl     = 'http://example.com/test/index.html';
const fileUrl      = 'file:///test/test.html';
const extensionUrl = 'moz-extension://12345/popup/index.html';
const invalidUrl   = 'aaaa';

test('extractDomain returns domain of a url', (t) => {
  t.is(extractDomain(validUrl), 'example.com');
  t.is(extractDomain(invalidUrl), null);
});

const { browser }        = global;
const { getBrowserInfo } = browser.runtime;
function setupBrowserInfo(name) {
  browser.runtime.getBrowserInfo = nisemono.func();
  nisemono.expects(browser.runtime.getBrowserInfo).resolves({ name });
}

function restoreBrowserInfo() {
  browser.runtime.getBrowserInfo = getBrowserInfo;
}

test('getFaviconUrl returns favison url from web page url', async (t) => {
  setupBrowserInfo('Firefox');
  await init();
  const faviconUrl = 'https://s2.googleusercontent.com/s2/favicons?domain=example.com';
  t.is(getFaviconUrl(validUrl), faviconUrl);
  t.is(getFaviconUrl(fileUrl), null);
  t.is(getFaviconUrl(extensionUrl), null);
  t.is(getFaviconUrl(invalidUrl), null);
  t.is(getFaviconUrl(null), null);

  setupBrowserInfo('chrome');
  await init();

  t.is(getFaviconUrl(validUrl), `chrome://favicon/${validUrl}`);
  t.is(getFaviconUrl(fileUrl), `chrome://favicon/${fileUrl}`);
  t.is(getFaviconUrl(extensionUrl), `chrome://favicon/${extensionUrl}`);
  t.is(getFaviconUrl(invalidUrl), `chrome://favicon/${invalidUrl}`);

  restoreBrowserInfo();
});
