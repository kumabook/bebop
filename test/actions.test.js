import test from 'ava';
import {
  activateTab,
  closeTab,
  openUrlsInNewTab,
  openUrl,
  clickLink,
  openLinkInNewTab,
  openLinkInNewWindow,
  openLinkInPrivateWindow,
  searchWithGoogle,
  searchWithGoogleInNewTab,
  deleteHistory,
  deleteBookmark,
  runCommand,
} from '../src/actions';

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

test('openUrlsInNewTab', (t) => {
  openUrlsInNewTab([{ type: 'history', args: urlArgs }]);
  openUrlsInNewTab([]);
  t.pass();
});

test('openUrl', (t) => {
  openUrl([{ type: 'history', args: urlArgs }]);
  openUrl([]);
  t.pass();
});

test('clickLink', (t) => {
  clickLink([{ type: 'link', args: linkArgs }]);
  clickLink([]);
  t.pass();
});

test('openLinkInNewTab', (t) => {
  openLinkInNewTab([{ type: 'link', args: linkArgs }]);
  openLinkInNewTab([]);
  t.pass();
});

test('openLinkInNewWindow', (t) => {
  openLinkInNewWindow([{ type: 'link', args: linkArgs }]);
  openLinkInNewWindow([]);
  t.pass();
});

test('openLinkInPrivateWindow', (t) => {
  openLinkInPrivateWindow([{ type: 'link', args: linkArgs }]);
  openLinkInPrivateWindow([]);
  t.pass();
});

test('searchWithGoogle', (t) => {
  searchWithGoogle([{ type: 'search', args: searchArgs }]);
  searchWithGoogle([]);
  t.pass();
});

test('searchWithGoogleInNewTab', (t) => {
  searchWithGoogleInNewTab([{ type: 'search', args: searchArgs }]);
  searchWithGoogleInNewTab([]);
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
