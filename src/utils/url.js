import browser from 'webextension-polyfill';

/* global globalThis */
// window does not exist in the MV3 background service worker
const { URL } = globalThis;
const faviconUrl = 'https://s2.googleusercontent.com/s2/favicons';
let browserInfo = { name: 'chrome' };

export function init() {
  if (browser.runtime.getBrowserInfo) {
    return browser.runtime.getBrowserInfo().then((info) => {
      browserInfo = info;
    });
  }
  return Promise.resolve();
}

export function extractDomain(url) {
  if (!url || url.startsWith('moz-extension:') || url.startsWith('file:')) {
    return null;
  }
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
}

export function getFaviconUrl(url) {
  switch (browserInfo.name) {
    case 'chrome':
      // chrome://favicon was removed in MV3; use the _favicon endpoint
      // (requires the "favicon" permission).
      if (browser.runtime.getManifest().manifest_version >= 3) {
        return `${browser.runtime.getURL('_favicon/')}?pageUrl=${encodeURIComponent(url)}&size=16`;
      }
      return `chrome://favicon/${url}`;
    default: {
      const domain = extractDomain(url);
      if (domain) {
        return `${faviconUrl}?domain=${domain}`;
      }
      return null;
    }
  }
}

export function isExtensionUrl(url) {
  return url.startsWith('chrome-extension') || url.startsWith('moz-extension');
}

init();
