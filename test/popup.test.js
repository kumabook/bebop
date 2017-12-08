import test from 'ava';
import '../src/popup';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

test('popup succeeds in rendering html', async (t) => {
  await delay(500);
  const { document } = window;
  const form = document.querySelector('form.commandForm');
  t.truthy(form !== null);
});
