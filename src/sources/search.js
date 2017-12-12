import browser from 'webextension-polyfill';
import getMessage from '../utils/i18n';

export default function candidates(q) {
  let query = '';
  if (q) {
    query += `${q} ― `;
  }
  return Promise.resolve([{
    id:         `google-search-${q}`,
    label:      `${query}Search with Google`,
    type:       'search',
    args:       [q],
    faviconUrl: browser.extension.getURL('images/search.png'),
  }]).then(items => ({
    items,
    label: `${getMessage('search')} (:search or s)`,
  }));
}
