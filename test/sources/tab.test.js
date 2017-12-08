import test from 'ava';
import nisemono from 'nisemono';
import candidates from '../../src/sources/tab';

const { browser } = global;
const { query } = browser.tabs;
function setup() {
  browser.tabs.query = nisemono.func();
  nisemono.expects(browser.tabs.query).resolves([{
    id:       'tab-0',
    title:    'title',
    url:      'https://example.com/',
    windowId: 'window-0',
  }]);
}

function restore() {
  browser.tabs.query = query;
}

test.beforeEach(setup);
test.afterEach(restore);

test('candidates() searches tabs ', t => candidates('').then(({ items, label }) => {
  t.true(label !== null);
  t.is(items.length, 1);
  t.is(items[0].id, 'tab-0');
}));
