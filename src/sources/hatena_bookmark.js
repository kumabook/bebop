import browser from 'webextension-polyfill';
import { getFaviconUrl } from '../utils/url';

const openOptionCommand = {
  id:         'hatena-options',
  label:      'Set hatena user name',
  type:       'command',
  args:       ['open-options'],
  faviconUrl: browser.extension.getURL('images/options.png'),
};

function createDataStructure(text) {
  const infos = text.split('\n');
  const bookmarks = infos.splice(0, infos.length * (3 / 4));
  return [bookmarks, infos];
}

/**
 * fetchHatenaBookmarks
 * @returns {}
 */
async function fetchHatenaBookmarks(userName) {
  const bookmarkList = [];

  let text = await fetch(`http://b.hatena.ne.jp/${userName}/search.data`);
  text = await text.text();

  const commentRe = new RegExp('\\s+$', '');
  const [bookmarks, infos] = createDataStructure(text);

  const len = infos.length;

  for (let i = len - 1; i >= 0; i -= 1) {
    const bi = i * 3;
    const timestamp = infos[i].split('\t', 2)[1];
    const title = bookmarks[bi];
    const comment = bookmarks[bi + 1];
    const url = bookmarks[bi + 2];
    const b = {};
    b.title = title;
    b.comment = comment.replace(commentRe, '');
    b.url = url;
    b.date = parseInt(timestamp, 10);

    bookmarkList.push(b);
  }

  return bookmarkList;
}

function expired(/* data */) {
  return false;
}

async function fetchCachedHatenaBookmarks(userName) {
  const { hatebu } = await browser.storage.local.get('hatebu');
  if (hatebu && !expired(hatebu)) {
    return hatebu;
  }
  const data = await fetchHatenaBookmarks(userName);
  await browser.storage.local.set({ hatebu: data });
  return data;
}

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
