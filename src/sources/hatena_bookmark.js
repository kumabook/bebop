import browser from 'webextension-polyfill';
import { getFaviconUrl } from '../utils/url';
import getMessage from '../utils/i18n';

/**
 * fetchHatenaBookmarks
 * @returns {}
 */
async function fetchHatenaBookmarks(userName) {
  let bookmarkList = [];

  let text = await fetch(`http://b.hatena.ne.jp/${userName}/search.data`);
  text = await text.text();

  function createDataStructure(text) {
    let infos = text.split("\n");
    let bookmarks = infos.splice(0, infos.length * 3/4);
    return [bookmarks, infos];
  }

  let commentRe = new RegExp('\\s+$','');
  let [bookmarks, infos] = createDataStructure(text);

  let len = infos.length;

  for (let i = len - 1;  i >= 0; i--) {
    let bi = i * 3;
    let timestamp = infos[i].split("\t", 2)[1];
    let title = bookmarks[bi];
    let comment = bookmarks[bi+1];
    let url = bookmarks[bi+2];
    let b = {};
    b.title = title;
    b.comment = comment.replace(commentRe, '');
    b.url = url;
    b.date = parseInt(timestamp);

    bookmarkList.push(b);
  }

  return bookmarkList;
}

function expired(data) {
  return false;
}

async function fetchCachedHatenaBookmarks(userName) {
  let { hatebu } = await browser.storage.local.get("hatebu");
  if (hatebu && !expired(hatebu)) {
    return hatebu;
  }
  let data = await fetchHatenaBookmarks(userName);
  await browser.storage.local.set({ "hatebu": data });
  return data;
}

export default async function candidates(q, { maxResults } = {}) {
  let { hatenaUserName } = await browser.storage.local.get("hatenaUserName");
  if (!hatenaUserName) {
    return {
      items: [],
      label: `Hatena Bookmarks: Please specify username at Preference`
    };
  }

  // To make search efficient ...
  let bookmarks = await fetchCachedHatenaBookmarks(hatenaUserName);
  let results = [];
  for (let i = bookmarks.length - 1; i != 0; --i) {
    let bookmark = bookmarks[i];
    if (bookmark.title.includes(q)
        || bookmark.comment.includes(q)
        || bookmark.url.includes(q)) {
      results.push(bookmark);
    }
    if (results.length >= maxResults) {
      break;
    }
  }

  let items = results.map((v, id) => ({
    id:         `${id}`,
    label:      `${v.title}:${v.url}:${v.comment}`,
    type:       'hatebu',
    args:       [v.url, v.id],
    faviconUrl: getFaviconUrl(v.url)
  }));

  return {
    items,
    label: `Hatena Bookmarks (:hatebu or hb)`
  };
}
