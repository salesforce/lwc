/* eslint-env node */
module.exports = {
  target: 'node',
  entry: './packages/raptor-compiler-core/dist/index.js',
  output: {
    path: './dist/node',
    filename: 'compiler.js',
    libraryTarget: "commonjs-module"
  }
}