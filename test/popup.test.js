import test from 'ava';
import '../src/popup';

test('popup succeeds in rendering html', (t) => {
  const { document } = window;
  const form = document.querySelector('form.commandForm');
  t.truthy(form !== null);
});
