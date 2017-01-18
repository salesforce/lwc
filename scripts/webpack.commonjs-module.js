const webpack = require('webpack');
module.exports = {
  target: 'node',
  entry: './packages/raptor-compiler-core/src/index.js',
  output: {
    path: './dist/node',
    filename: 'compiler.js',
    libraryTarget: "commonjs-module"
  }
}