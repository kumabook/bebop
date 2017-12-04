import test from 'ava';
import {
  HIGHLIGHTER_ID,
  LINK_MARKER_CLASS,
  getTargetElements,
  search,
  createHighlighter,
  highlight,
  dehighlight,
  click,
} from '../src/link';

function a(url, text) {
  return `<a href="${url}" style="height: 10px;">${text}</a>`;
}

function setup() {
  const { document } = window;
  const container = document.getElementById('container');
  const links = [
    a('https://example.org/', 'normal link'),
    a('/relative', 'relative link'),
    a('//outside.com/', 'no protocol link'),
  ];
  container.innerHTML = links.join('\n');
}

test.beforeEach(setup);
test.afterEach(dehighlight);

test('getTargetElements returns visible and clickable links', (t) => {
  setup();
  const targets = getTargetElements();
  t.is(targets.length, 3);
});

test('search returns visible and clickable links', (t) => {
  setup();
  const candidates = search();
  t.is(candidates.length, 3);
  t.deepEqual(candidates[0], {
    id:    '0-https://example.org/',
    index: 0,
    url:   'https://example.org/',
    label: 'normal link',
  });
  t.deepEqual(candidates[1], {
    id:    '1-https://example.org/relative',
    index: 1,
    url:   'https://example.org/relative',
    label: 'relative link',
  });
  t.deepEqual(candidates[2], {
    id:    '2-https://outside.com/',
    index: 2,
    url:   'https://outside.com/',
    label: 'no protocol link',
  });
});

test('createHighlighter returns highter element', (t) => {
  t.truthy(createHighlighter({
    left:   10,
    top:    10,
    width:  10,
    height: 10,
  }));
});

test('highlight appends highlight element and link markers', (t) => {
  setup();
  highlight({ index: 0, url: 'https://example.org/' });
  t.truthy(document.getElementById(HIGHLIGHTER_ID));
  t.true(document.getElementsByClassName(LINK_MARKER_CLASS).length === 3);
});

test('dehighlight removes highlight element and link markers', (t) => {
  setup();
  highlight({ index: 0, url: 'https://example.org/' });
  dehighlight();
  t.falsy(document.getElementById(HIGHLIGHTER_ID));
  t.true(document.getElementsByClassName(LINK_MARKER_CLASS).length === 0);
});

test('click triggers target element click', (t) => {
  setup();
  click({ index: 0, url: 'https://example.org/' });
  click({ index: 1, url: 'https://example.org/relative' });
  t.pass();
});
