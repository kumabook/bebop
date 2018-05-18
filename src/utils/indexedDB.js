/* global indexedDB: false */

function open(dbName, version = 1) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version, { storage: 'persistent' });
    request.onerror = event => reject(event);
    request.onsuccess = event => resolve(event.target.result);
  });
}

function upgrade(dbName, version = 1, callback) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version, { storage: 'persistent' });
    request.onerror = event => reject(event);
    request.onsuccess = event => resolve(event.target.result);
    request.onupgradeneeded = (event) => {
      callback(event.target.result).then(() => {
        resolve(event.target.result);
      });
    };
  });
}

function transactionComplete(store) {
  /* eslint-disable  no-param-reassign */
  return new Promise((resolve) => {
    store.transaction.oncomplete = resolve;
  });
}

function destroy(dbName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    request.onerror = event => reject(event);
    request.onsuccess = event => resolve(event.target.result);
  });
}

export default {
  open,
  upgrade,
  transactionComplete,
  destroy,
};
