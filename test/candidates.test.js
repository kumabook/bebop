import test from 'ava';
import { parse, init } from '../src/candidates';

test('parse returns query type and value', (t) => {
  /* eslint-disable no-multi-spaces, comma-spacing */
  init();
  t.deepEqual(parse('')               , { type: null  , value: '' });
  t.deepEqual(parse('aaaa')           , { type: null  , value: 'aaaa' });
  t.deepEqual(parse(':link')          , { type: 'link', value: '' });
  t.deepEqual(parse(':link aaaa')     , { type: 'link', value: 'aaaa' });
  t.deepEqual(parse(':link aaaa bbbb'), { type: 'link', value: 'aaaa bbbb' });
  t.deepEqual(parse('l')              , { type: 'link', value: '' });
  t.deepEqual(parse('l aaaa')         , { type: 'link', value: 'aaaa' });
  t.deepEqual(parse('l aaaa bbbb')    , { type: 'link', value: 'aaaa bbbb' });
  t.deepEqual(parse('link')           , { type: null  , value: 'link' });
});
