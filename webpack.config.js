const webpack = require('webpack');
module.exports = {
  entry: {
    background:      './src/background.js',
    popup:           './src/popup.jsx',
    content_scripts: './src/content_script.js',
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
      'process.env': { NODE_ENV: JSON.stringify('production') },
    }),
  ],
  devtool: 'source-map',
};
