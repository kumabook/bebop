import browser from 'webextension-polyfill';

let popupWindow = null;
let activeTabId = null;

// MV3 service worker can be terminated anytime; mirror the popup window id
// into storage.session so toggle/focus handlers survive a restart.
const sessionStorage = browser.storage && browser.storage.session;

function persistPopupWindowId() {
  if (sessionStorage) {
    sessionStorage.set({ popupWindowId: popupWindow ? popupWindow.id : null }).catch(() => {});
  }
}

async function restorePopupWindow() {
  if (!sessionStorage) {
    return;
  }
  try {
    const { popupWindowId } = await sessionStorage.get('popupWindowId');
    if (popupWindowId && !popupWindow) {
      popupWindow = await browser.windows.get(popupWindowId);
    }
  } catch (e) {
    popupWindow = null;
  }
}

const restored = restorePopupWindow();

export const defaultPopupWidth = 700;
export async function getDisplay() {
  const displays = await new Promise(resolve => browser.system.display.getInfo(resolve));
  if (displays.length > 0) {
    return displays[0];
  }
  return null;
}
export async function toggle() {
  await restored;
  if (popupWindow) {
    browser.windows.remove(popupWindow.id);
    popupWindow = null;
    persistPopupWindowId();
    return;
  }
  const { bounds } = await getDisplay();
  const url = browser.runtime.getURL('popup/index.html');
  const { popupWidth } = await browser.storage.local.get('popupWidth');
  const width  = popupWidth || defaultPopupWidth;
  const height = bounds.height * 0.5;
  const left   = bounds.left + Math.round((bounds.width - width) * 0.5);
  const top    = bounds.top + Math.round((bounds.height - height) * 0.5);
  popupWindow = await browser.windows.create({
    left,
    top,
    width,
    height,
    url,
    focused: true,
    type:    'popup',
  });
  persistPopupWindowId();
}

export function onTabRemoved(tabId, { windowId }) {
  if (popupWindow && popupWindow.id === windowId) {
    popupWindow = null;
    persistPopupWindowId();
  }
  if (activeTabId === tabId) {
    activeTabId = null;
  }
}

export async function onWindowFocusChanged(windowId) {
  await restored;
  if (!popupWindow) {
    return;
  }
  if (popupWindow.id !== windowId) {
    browser.windows.remove(popupWindow.id).catch(() => {});
  } else {
    popupWindow.focused = true;
  }
}

export function onTabActivated({ tabId, windowId }) {
  if (popupWindow && popupWindow.id === windowId) {
    return;
  }
  activeTabId = tabId;
}

export function getPopupWindow() {
  return popupWindow;
}

export function getActiveTabId() {
  return activeTabId;
}
