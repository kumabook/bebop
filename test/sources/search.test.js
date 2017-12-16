import test from 'ava';
import candidates from '../../src/sources/search';

test('candidates() returns search candidates ', t => candidates('q', { maxResults: 5 }).then(({ items, label }) => {
  t.true(label !== null);
  t.is(items.length, 1);
  t.is(items[0].id, 'google-search-q');
}));
