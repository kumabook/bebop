import browser from 'webextension-polyfill';

const HIGHLIGHTER_ID = 'bebop-highlighter';
const LINK_MARKER_ID = 'bebop-link-marker';
const MARKER_SIZE    = 12;

function getTargetElements() {
  const elements = document.getElementsByTagName('a');
  return Array.prototype.filter.call(elements, (e) => {
    const style = window.getComputedStyle(e);
    return style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      e.type !== 'hidden' &&
      e.offsetHeight > 0;
  });
}


export function search({ query = '', maxResults = 20 }) {
  return getTargetElements().map((link, index) => ({
    id:    `${index}-${link.href}`,
    url:   link.href,
    label: link.text,
    index,
  })).filter((l) => {
    const url = l.url.toLowerCase();
    const label = l.label.toLowerCase();
    return url.includes(query) || label.includes(query);
  }).slice(0, maxResults);
}

export function createHighlighter(rect) {
  const {
    left,
    top,
    width,
    height,
  } = rect;
  const e = document.createElement('div');
  e.id = HIGHLIGHTER_ID;
  e.style.position = 'absolute';
  e.style.top      = `${top}px`;
  e.style.left     = `${left}px`;
  e.style.width    = `${width}px`;
  e.style.height   = `${height}px`;
  e.style.border   = 'dashed 2px #FF8C00';
  e.style.zIndex   = 1000000;
  e.style.backgroundColor = '#FF8C0055';
  return e;
}

function createLinkMarker({ left, top }, selected) {
  const e = document.createElement('img');
  e.src = browser.extension.getURL('images/link.png');
  e.className      = LINK_MARKER_ID;
  e.style.position = 'absolute';
  e.style.display  = 'block';
  e.style.top      = `${top - (MARKER_SIZE * 0.5)}px`;
  e.style.left     = `${left - MARKER_SIZE}px`;
  e.style.width    = `${MARKER_SIZE}px`;
  e.style.height   = `${MARKER_SIZE}px`;
  e.style.zIndex   = 1000000;
  e.style.padding  = '2px';
  e.style.backgroundColor = selected ? '#FF8C00' : '#ADFF2F';
  e.borderRadius   = '5px';
  return e;
}

function removeHighlighter() {
  const e = document.getElementById(HIGHLIGHTER_ID);
  if (e) {
    e.parentNode.removeChild(e);
  }
}

function removeLinkMarkers() {
  const elements = document.getElementsByClassName(LINK_MARKER_ID);
  for (let i = elements.length - 1; i >= 0; i -= 1) {
    elements[i].parentNode.removeChild(elements[i]);
  }
}

export function highlight({ index, url } = {}) {
  const elements = getTargetElements();
  for (let i = 0, len = elements.length; i < len; i += 1) {
    const l = elements[i];
    const r = l.getBoundingClientRect();
    const rect = {
      left:   r.left + window.pageXOffset,
      top:    r.top + window.pageYOffset,
      width:  r.width,
      height: r.height,
    };
    const selected = i === index && l.href === url;
    const marker = createLinkMarker(rect, selected);
    document.body.appendChild(marker);
    if (selected) {
      const highlighter = createHighlighter(rect);
      document.body.appendChild(highlighter);
      l.scrollIntoView({ block: 'end' });
    }
  }
}

export function dehighlight() {
  removeHighlighter();
  removeLinkMarkers();
}
