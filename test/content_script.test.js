import test from 'ava';
import {
  executeCommand,
  portMessageListener,
  messageListener,
} from '../src/content_script';

const delay  = ms => new Promise(resolve => setTimeout(resolve, ms));

test('content_script', async (t) => {
  await delay(500);
  t.pass();
});

test('executeCommand calls contentHandler of a command', async (t) => {
  executeCommand('click', []);
  t.pass();
});

test('executeCommand does nothing for comamdn that has no contentHandler', async (t) => {
  executeCommand('unknown', []);
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

test.cb('messageListener handles FETCH_LINKS messages from popup', (t) => {
  const message = { type: 'FETCH_LINKS', payload: { query: '', maxResults: 20 } };
  messageListener(message, {}, () => t.end());
});

test.cb('messageListener handles CHANGE_CANDIDATE messages from popup', (t) => {
  const message = { type: 'CHANGE_CANDIDATE', payload: { type: 'search' } };
  messageListener(message, {}, () => t.end());
});

test.cb('messageListener handles CHANGE_CANDIDATE messages with a link candidate, from popup', (t) => {
  const message = { type: 'CHANGE_CANDIDATE', payload: { type: 'link', args: [] } };
  messageListener(message, {}, () => t.end());
});

test.cb('messageListener handles EXECUTE_COMMAND messages from popup', (t) => {
  const message = { type: 'EXECUTE_COMMAND', payload: { commandName: 'open', candidates: [] } };
  messageListener(message, {}, () => t.end());
});

test.cb('messageListener does not handle unknown messages from popup', (t) => {
  const message = { type: 'UNKNOWN', payload: {} };
  messageListener(message, {}, () => t.end());
});

