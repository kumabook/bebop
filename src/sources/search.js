import browser from 'webextension-polyfill';
import getMessage from '../utils/i18n';

export default function candidates(q) {
  return Promise.resolve([{
    id:         `google-seach-${q}`,
    label:      `${q} － Search with Google`,
    type:       'search',
    name:       'google-search',
    args:       [q],
    faviconUrl: browser.extension.getURL('images/search.png'),
  }]).then(items => ({
    items,
    label: `${getMessage('search')} (:search or s)`,
  }));
}
