import test from 'ava';
import {
  activateTab,
  closeTab,
  openUrls,
  goUrl,
  clickLink,
  openLink,
  openGoogleSearch,
  goGoogleSearch,
  deleteHistory,
  deleteBookmark,
  runCommand,
} from '../src/commands';

const tabArgs = [1];
const urlArgs = ['http://example.com'];
const linkArgs = [{ url: 'http://example.com' }];
const searchArgs = ['query'];

test('activateTab', (t) => {
  activateTab([{ type: 'tab', args: tabArgs }]);
  activateTab([]);
  t.pass();
});

test('closeTab', (t) => {
  closeTab([{ type: 'tab', args: tabArgs }]);
  closeTab([]);
  t.pass();
});

test('open', (t) => {
  openUrls([{ type: 'history', args: urlArgs }]);
  openUrls([]);
  t.pass();
});

test('go', (t) => {
  goUrl([{ type: 'history', args: urlArgs }]);
  goUrl([]);
  t.pass();
});

test('clickLink', (t) => {
  clickLink([{ type: 'link', args: linkArgs }]);
  clickLink([]);
  t.pass();
});

test('openLink', (t) => {
  openLink([{ type: 'link', args: linkArgs }]);
  openLink([]);
  t.pass();
});

test('openGoogleSearch', (t) => {
  openGoogleSearch([{ type: 'search', args: searchArgs }]);
  openGoogleSearch([]);
  t.pass();
});

test('goGoogleSearch', (t) => {
  goGoogleSearch([{ type: 'search', args: searchArgs }]);
  goGoogleSearch([]);
  t.pass();
});

test('deleteHistory', (t) => {
  deleteHistory([{ type: 'history', args: urlArgs }]);
  deleteHistory([]);
  t.pass();
});

test('deleteHBookmark', (t) => {
  deleteBookmark([{ type: 'history', args: urlArgs }]);
  deleteBookmark([]);
  t.pass();
});

test('runCommand', (t) => {
  runCommand([{ type: 'command', args: ['open-options'] }]);
  runCommand([{ type: 'command', args: ['unknown'] }]);
  t.pass();
});
