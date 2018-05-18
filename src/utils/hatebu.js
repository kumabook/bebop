/* global fetch: false */
import browser from 'webextension-polyfill';
import logger from 'kiroku';
import Model from './model';
import idb from './indexedDB';
import config from '../config';

export const Bookmark = new Model('hatena-bookmarks');

const storageKey = 'indexeddb.hatebu';

function createDataStructure(text) {
  const infos = text.split('\n');
  const bookmarks = infos.splice(0, infos.length * (3 / 4));
  return [bookmarks, infos];
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
  const response = await fetch(`http://b.hatena.ne.jp/${userName}/search.data`);
  if (!response.ok) {
    logger.info(`${userName} doesn't exist`);
    return null;
  }
  logger.info(`Downloaded ${userName} bookmarks`);
  const text = await response.text();
  const commentRe = new RegExp('\\s+$', '');
  const [bookmarks, infos] = createDataStructure(text);

  const len = infos.length;
  const db = await idb.open(config.dbName, config.dbVersion);
  if (needClear(userName)) {
    Bookmark.clear(db);
  }
  for (let i = len - 1; i >= 0; i -= 1) {
    const bi = i * 3;
    const timestamp = infos[i].split('\t', 2)[1];
    const title = bookmarks[bi];
    const comment = bookmarks[bi + 1];
    const url = bookmarks[bi + 2];
    const date = parseInt(timestamp, 10);
    logger.trace(`Saving ${title} to object store for ${userName}`);
    try {
      // eslint-disable-next-line no-await-in-loop
      await Bookmark.create({
        id:         timestamp,
        comment:    comment.replace(commentRe, ''),
        title,
        url,
        created_at: date,
        updated_at: date,
      }, db);
    } catch (e) {
      logger.trace(e);
      return false;
    }
    logger.trace(`Saved ${title} to object store for ${userName}`);
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
