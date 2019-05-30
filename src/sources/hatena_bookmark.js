import browser from 'webextension-polyfill';
import { getFaviconUrl } from '../utils/url';
import { fetchBookmarks } from '../utils/hatebu';
import getMessage from '../utils/i18n';

const openOptionCommand = {
  id:         'hatena-options',
  label:      `${getMessage('hatena_options_hint')}`,
  type:       'command',
  args:       ['open-options'],
  faviconUrl: browser.extension.getURL('images/options.png'),
};

export default async function candidates(q, { maxResults } = {}) {
  const { hatenaUserName } = await browser.storage.local.get('hatenaUserName');
  if (!hatenaUserName && maxResults !== 0) {
    return {
      items: [openOptionCommand],
      label: `${getMessage('hatena_bookmarks_hint')}`,
    };
  }

  // To make search efficient ...
  const bookmarks = await fetchBookmarks(hatenaUserName);
  const results = [];
  for (let i = bookmarks.length - 1; i >= 0; i -= 1) {
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
    label: `${getMessage('hatena_bookmarks')} (:hatebu or hb)`,
  };
}
