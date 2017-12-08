import test from 'ava';
import nisemono from 'nisemono';
import candidates from '../../src/sources/history';

const { browser } = global;
const { search } = browser.history;
function setup() {
  browser.history.search = nisemono.func();
  nisemono.expects(browser.history.search).resolves([{
    id:    'history-0',
    title: 'title',
    url:   'https://example.com/',
  }]);
}

function restore() {
  browser.history.search = search;
}

test.beforeEach(setup);
test.afterEach(restore);

test('candidates() search histories ', t => candidates('').then(({ items, label }) => {
  t.true(label !== null);
  t.is(items.length, 1);
  t.is(items[0].id, 'history-0');
}));
