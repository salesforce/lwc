const webpack = require('webpack');
module.exports = {
  entry: './packages/raptor-compiler-core/src/index.js',
  output: {
    path: './dist',
    filename: 'compiler.js',
    libraryTarget: 'var',
    library: 'RaptorCompiler'
  },
  module: {
    loaders:[
      {
        test: /\.json$/,
        loader: 'json-loader',
      }
    ]
  },
  node: {
    child_process: 'empty',
    fs: 'empty',
    module: 'empty',
    net: 'empty',
    readline: 'empty',
    process: 'mock'
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.hrtime': 'performance.now' }),
  ]
}