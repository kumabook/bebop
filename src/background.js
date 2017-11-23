/* global browser: false */
import logger from 'kiroku';

if (process.env.NODE_ENV === 'production') {
  logger.setLevel('INFO');
}
logger.info(`bebop starts initialization. log level ${logger.getLevel()}`);

browser.commands.onCommand.addListener((command) => {
  switch (command) {
  default:
    break;
  }
});
