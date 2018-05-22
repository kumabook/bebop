/* global fetch: false */
import browser from 'webextension-polyfill';
import logger from 'kiroku';
import Model from './model';
import idb from './indexedDB';
import fetchAsText from './http';
import config from '../config';

export const Bookmark = new Model('hatena-bookmarks');

const storageKey = 'indexeddb.hatebu';
const commentRegex = new RegExp('\\s+$', '');

function parse(text) {
  const infos = text.split('\n');
  const bookmarks = infos.splice(0, infos.length * (3 / 4));
  return { bookmarks, infos, length: infos.length };
}

function getBookmarkObj({ bookmarks, infos }, i) {
  const index     = i * 3;
  const timestamp = infos[i].split('\t', 2)[1];
  const title     = bookmarks[index];
  const comment   = bookmarks[index + 1];
  const url       = bookmarks[index + 2];
  const date      = parseInt(timestamp, 10);
  return {
    id:         timestamp,
    comment:    comment.replace(commentRegex, ''),
    title,
    url,
    created_at: date,
    updated_at: date,
  };
}

export function createObjectStore(db) {
  return Bookmark.createObjectStore(db);
}

export function needClear(userName) {
  const v = browser.storage.local.get(storageKey);
  return !v || !v[storageKey] || v[storageKey].userName !== userName;
}

export function needDownload(userName) {
  const now = Date.now();
  const value = browser.storage.local.get(storageKey);
  const duration = 24 * 60 * 60 * 1000;
  if (!value || !value[storageKey]) {
    return true;
  }
  return value[storageKey].userName !== userName ||
    value[storageKey].lastDownloadedAt + duration < now;
}

export async function downloadBookmarks(userName) {
  const url = `http://b.hatena.ne.jp/${userName}/search.data`;
  const text = await fetchAsText(url);
  logger.info(`Downloaded ${userName} bookmarks`);
  const bookmarkList = parse(text);
  const db = await idb.open(config.dbName, config.dbVersion);
  if (needClear(userName)) {
    Bookmark.clear(db);
  }
  for (let i = bookmarkList.length - 1; i >= 0; i -= 1) {
    try {
      const obj = getBookmarkObj(bookmarkList, i);
      logger.trace(`Saving ${obj.title} to object store for ${userName}`);
      // eslint-disable-next-line no-await-in-loop
      await Bookmark.create(obj, db);
      logger.trace(`Saved ${obj.title} to object store for ${userName}`);
    } catch (e) {
      logger.trace(e);
      return false;
    }
  }
  await browser.storage.local.set(storageKey, {
    userName,
    lastDownloadedAt: Date.now(),
  });
  return true;
}

export async function fetchBookmarks() {
  const db = await idb.open(config.dbName, config.dbVersion);
  try {
    return await Bookmark.findAll(db);
  } catch (e) {
    return [];
  }
}
