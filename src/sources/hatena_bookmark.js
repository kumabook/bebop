import browser from 'webextension-polyfill';
import { getFaviconUrl } from '../utils/url';
import { fetchCachedHatenaBookmarks } from '../utils/hatebu';

const openOptionCommand = {
  id:         'hatena-options',
  label:      'Set hatena user name',
  type:       'command',
  args:       ['open-options'],
  faviconUrl: browser.extension.getURL('images/options.png'),
};

export default async function candidates(q, { maxResults } = {}) {
  const { hatenaUserName } = await browser.storage.local.get('hatenaUserName');
  if (!hatenaUserName && maxResults !== 0) {
    return {
      items: [openOptionCommand],
      label: 'Hatena Bookmarks: Please specify username at options ui',
    };
  }

  // To make search efficient ...
  const bookmarks = await fetchCachedHatenaBookmarks(hatenaUserName);
  const results = [];
  for (let i = bookmarks.length - 1; i !== 0; i -= 1) {
    const bookmark = bookmarks[i];
    if (bookmark.title.includes(q)
        || bookmark.comment.includes(q)
        || bookmark.url.includes(q)) {
      results.push(bookmark);
    }
    if (results.length >= maxResults) {
      break;
    }
  }

  const items = results.map((v, id) => ({
    id:         `hatenbu-${id}`,
    label:      `${v.title}:${v.url}:${v.comment}`,
    type:       'hatebu',
    args:       [v.url, v.id],
    faviconUrl: getFaviconUrl(v.url),
  }));

  return {
    items,
    label: 'Hatena Bookmarks (:hatebu or hb)',
  };
}
