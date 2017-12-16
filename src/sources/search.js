import browser from 'webextension-polyfill';
import getMessage from '../utils/i18n';

export default function candidates(q, { maxResults }) {
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
    items: items.slice(0, maxResults),
    label: `${getMessage('search')} (:search or s)`,
  }));
}
