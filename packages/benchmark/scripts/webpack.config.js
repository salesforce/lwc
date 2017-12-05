const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const {
    FILES,
    DIST_DIR,
    RUNNER_DIR,
} = require('./config');

module.exports = [{
  entry: path.resolve(RUNNER_DIR, 'browser/main.js'),
  output: {
    filename: FILES.app,
    path: DIST_DIR,
  },
  plugins: [
      new HtmlWebpackPlugin({
          template: path.resolve(RUNNER_DIR, 'browser/static/index.html'),
      }),
  ]
}, {
    entry: path.resolve(RUNNER_DIR, 'iframe-runner/main.js'),
    output: {
        filename: FILES.runner,
        path: DIST_DIR,
        library: 'runner',
        libraryTarget: 'umd'
    }
}];
