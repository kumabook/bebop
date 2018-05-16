const webpack = require('webpack');

const NODE_ENV = process.env.NODE_ENV || 'production';
module.exports = {
  mode: NODE_ENV,
  entry: {
    background:      './src/background.js',
    popup:           './src/popup.jsx',
    content_scripts: './src/content_script.js',
    options_ui:      './src/options_ui.jsx',
  },
  output: {
    path:     `${__dirname}/`,
    filename: '[name]/bundle.js',
  },
  module: {
    rules: [
      { test: /\.css$/, use: 'css-loader' },
      { test: /\.jsx?$/, use: 'babel-loader', exclude: /(node_modules|bower_components)/ },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(NODE_ENV) },
    }),
  ],
  devtool: 'source-map',
};
