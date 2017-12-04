const webpack = require('webpack');
const webExt  = require('web-ext').default;
const config  = require('./webpack.config');

const compiler = webpack(config);
const watching = compiler.watch({
}, (err, stats) => {
  console.log('weback built');
});

webExt.cmd.run({
  firefox:        process.env.FIREFOX_BINARY,
  sourceDir:      process.cwd(),
  ignoreFiles:    ['**/*~', 'web-ext-artifacts/', 'src/', 'test/'],
  browserConsole: true,
}, {
  shouldExitProgram: false,
}).then((runner) => runner.registerCleanup(() => watching.close()));
