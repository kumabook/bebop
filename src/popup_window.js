import browser from 'webextension-polyfill';

let popupWindow = null;
let activeTabId = null;

export const defaultPopupWidth = 700;
export async function getDisplay() {
  const displays = await new Promise(resolve => browser.system.display.getInfo(resolve));
  if (displays.length > 0) {
    return displays[0];
  }
  return null;
}
export async function toggle() {
  if (popupWindow) {
    browser.windows.remove(popupWindow.id);
    popupWindow = null;
    return;
  }
  const { bounds } = await getDisplay();
  const url = browser.extension.getURL('popup/index.html');
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
}

export function onTabRemoved(tabId, { windowId }) {
  if (popupWindow && popupWindow.id === windowId) {
    popupWindow = null;
  }
  if (activeTabId === tabId) {
    activeTabId = null;
  }
}

export async function onWindowFocusChanged(windowId) {
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
