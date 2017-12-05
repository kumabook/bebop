import browser from 'webextension-polyfill';

export default function candidates(q) {
  return Promise.resolve([{
    id:         `google-seach-${q}`,
    label:      `${q} － Search with Google`,
    type:       'search',
    name:       'google-search',
    args:       [q],
    faviconUrl: browser.extension.getURL('images/search.png'),
  }]);
}
