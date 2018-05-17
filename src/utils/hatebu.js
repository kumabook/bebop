import browser from 'webextension-polyfill';

function createDataStructure(text) {
  const infos = text.split('\n');
  const bookmarks = infos.splice(0, infos.length * (3 / 4));
  return [bookmarks, infos];
}

/**
 * fetchHatenaBookmarks
 * @returns {}
 */
export async function fetchHatenaBookmarks(userName) {
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

export async function fetchCachedHatenaBookmarks(userName) {
  const { hatebu } = await browser.storage.local.get('hatebu');
  if (hatebu && !expired(hatebu)) {
    return hatebu;
  }
  const data = await fetchHatenaBookmarks(userName);
  await browser.storage.local.set({ hatebu: data });
  return data;
}
