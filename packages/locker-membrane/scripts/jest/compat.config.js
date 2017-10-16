
module.exports = {
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  rootDir: '../../',
  testRegex: '/__tests__/',
  setupTestFrameworkScriptFile: './scripts/jest/compat-setup.js',
  transform: {
    '.(ts)': './scripts/jest/compat-preprocessor.js'
  }
}