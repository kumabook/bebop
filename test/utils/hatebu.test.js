import test from 'ava';
import idb from '../../src/utils/indexedDB';
import config from '../../src/config';
import {
  createObjectStore,
  Bookmark,
  fetchBookmarks,
} from '../../src/utils/hatebu';

test.beforeEach(async () => {
  await idb.upgrade(config.dbName, config.dbVersion, db => createObjectStore(db));
});

test.afterEach(() => {
  idb.destroy(config.dbName);
});

test.serial('fetchBookmarks returns empty array', async (t) => {
  const items = await fetchBookmarks();
  t.true(items.length === 0);
});

test.serial('fetchBookmarks returns hatena bookmarks', async (t) => {
  const db = await idb.open(config.dbName, config.dbVersion);
  await Bookmark.create({
    id:         Date.now(),
    comment:    'aaaa',
    title:      'aaaa',
    url:        'http://hatebu.com',
    created_at: new Date(),
    updated_at: new Date(),
  }, db);
  const items = await fetchBookmarks();
  t.true(items.length === 1);
});
