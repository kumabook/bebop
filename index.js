const webpack = require('webpack');
const config  = require('./webpack.config');

const compiler = webpack(config);
const watching = compiler.watch({ aggregateTimeout: 1000 }, (err) => {
  /* eslint-disable no-console */
  if (err) {
    console.log('\nFailed to webpack build');
  } else {
    console.log('\nwebpack built');
  }
});

// web-ext >= 7 is ESM-only
import('web-ext').then(({ default: webExt }) => webExt.cmd.run({
  firefox:        process.env.FIREFOX_BINARY,
  sourceDir:      process.cwd(),
  ignoreFiles:    (process.env.IGNORE_FILES || 'web-ext-artifacts test coverage').split(' ').concat('**/*~'),
  browserConsole: true,
  firefoxProfile: process.env.FIREFOX_PROFILE,
}, {
  shouldExitProgram: false,
})).then(runner => runner.registerCleanup(() => watching.close()));
