import test from 'ava';
import {
  executeAction,
  portMessageListener,
  messageListener,
} from '../src/content_script';

const delay  = ms => new Promise(resolve => setTimeout(resolve, ms));

test('content_script', async (t) => {
  await delay(500);
  t.pass();
});

test('executeAction calls contentHandler of a action', async (t) => {
  executeAction('click', []);
  t.pass();
});

test('executeAction does nothing for action that has no contentHandler', async (t) => {
  executeAction('unknown', []);
  t.pass();
});

test('portMessageListener handles POPUP_CLOSE message', (t) => {
  const message = { type: 'POPUP_CLOSE', payload: {} };
  portMessageListener(message);
  t.pass();
});

test('portMessageListener handles UNKNOWN message', (t) => {
  const message = { type: 'UNKNOWN', payload: {} };
  portMessageListener(message);
  t.pass();
});

test('messageListener handles FETCH_LINKS messages from popup', async (t) => {
  const message = { type: 'FETCH_LINKS', payload: { query: '', maxResults: 20 } };
  await messageListener(message);
  t.pass();
});

test('messageListener handles CHANGE_CANDIDATE messages from popup', async (t) => {
  const message = { type: 'CHANGE_CANDIDATE', payload: { type: 'search' } };
  await messageListener(message);
  t.pass();
});

test('messageListener handles CHANGE_CANDIDATE messages with a link candidate, from popup', async (t) => {
  const message = { type: 'CHANGE_CANDIDATE', payload: { type: 'link', args: [] } };
  await messageListener(message);
  t.pass();
});

test('messageListener handles EXECUTE_ACTION messages from popup', async (t) => {
  const message = { type: 'EXECUTE_ACTION', payload: { actionId: 'open', candidates: [] } };
  await messageListener(message, {}, () => t.end());
  t.pass();
});

test('messageListener does not handle unknown messages from popup', async (t) => {
  const message = { type: 'UNKNOWN', payload: {} };
  await messageListener(message, {}, () => t.end());
  t.pass();
});
