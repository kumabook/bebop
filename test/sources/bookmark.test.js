import test from 'ava';
import nisemono from 'nisemono';
import candidates from '../../src/sources/bookmark';

const { browser } = global;
const { search } = browser.bookmarks;
function setup() {
  browser.bookmarks.search = nisemono.func();
  nisemono.expects(browser.bookmarks.search).resolves([{
    id:    'bookmark-0',
    title: 'title',
    url:   'https://example.com/',
    type:  'bookmark',
  }]);
}

function restore() {
  browser.bookmarks.search = search;
}

test.beforeEach(setup);
test.afterEach(restore);

test('candidates() search bookmarks ', t => candidates('q').then(({ items, label }) => {
  t.true(label !== null);
  t.is(items.length, 1);
  t.is(items[0].id, 'bookmark-0');
}));
