module.exports =  function createPort() {
  const messageListeners = [];
  return {
    messageListeners,
    postMessage: () => {},
    onMessage:   {
      addListener:    listener => messageListeners.push(listener),
      removeListener: (listener) => {
        messageListeners.some((v, i) => {
          if (v === listener) {
            messageListeners.splice(i, 1);
          }
          return null;
        });
      },
    },
    onDisconnect: {
      addListener:    () => {},
      removeListener: () => {},
    },
  };
};
