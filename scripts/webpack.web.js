/* eslint-env node */
const webpack = require('webpack');
module.exports = {
  entry: './packages/raptor-compiler-core/dist/index.js',
  output: {
    path: './dist/web/',
    filename: 'compiler.js',
    libraryTarget: 'this',
    library: 'compiler'
  },
  node: {
    fs: 'empty',
    module: 'empty',
    net: 'empty',
  },
  plugins: [
    new webpack.DefinePlugin({
    'process.hrtime': 'performance.now',
  }),
  ]
}