import test from 'ava';
import '../src/options_ui';

test('options_ui succeeds in rendering html', (t) => {
  const { document } = window;
  const options = document.querySelector('div.options');
  t.truthy(options !== null);
});
