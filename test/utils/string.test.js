import test from 'ava';
import { includes } from '../../src/utils/string';

test('includes return first string has next string case-insensitively', async (t) => {
  t.true(includes('A', 'A'));
  t.true(includes('A', 'a'));
  t.true(!includes('b', 'a'));
  t.true(includes('ABCDE', 'Ab'));
});
