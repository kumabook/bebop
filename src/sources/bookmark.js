import browser from 'webextension-polyfill';
import { getFaviconUrl } from '../utils/url';
import getMessage from '../utils/i18n';

function bookmark2candidate(v) {
  return {
    id:         `${v.id}`,
    label:      `${v.title}:${v.url}`,
    type:       'bookmark',
    args:       [v.url, v.id],
    faviconUrl: getFaviconUrl(v.url),
  };
}

function searchOrRecent(q, maxResults) {
  if (!q) {
    return browser.bookmarks.getRecent(maxResults);
  }
  return browser.bookmarks.search({ query: q });
}

export default function candidates(q, { maxResults } = {}) {
  return searchOrRecent(q, maxResults)
    .then(l => l.filter(v => v.url).slice(0, maxResults).map(bookmark2candidate))
    .then(items => ({
      items,
      label: `${getMessage('bookmarks')} (:bookmark or b)`,
    }));
}
