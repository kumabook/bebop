const webpack = require('webpack');
const webExt  = require('web-ext').default;
const config  = require('./webpack.config');

const compiler = webpack(config);
const watching = compiler.watch({ aggregateTimeout: 1000 }, (err) => {
  /* eslint-disable no-console */
  if (err) {
    console.log('\nFailed to webpack build');
  } else {
    console.log('\nweback built');
  }
});

webExt.cmd.run({
  firefox:        process.env.FIREFOX_BINARY,
  sourceDir:      process.cwd(),
  ignoreFiles:    process.env.IGNORE_FILES.split(' ').concat('**/*~'),
  browserConsole: true,
}, {
  shouldExitProgram: false,
}).then(runner => runner.registerCleanup(() => watching.close()));
