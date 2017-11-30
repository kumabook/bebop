/* global URL: false */
import browser from 'webextension-polyfill';

const { URL } = window;
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
  if (url.startsWith('moz-extension:') || url.startsWith('file:')) {
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

init();
