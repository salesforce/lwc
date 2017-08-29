module.exports = {
    moduleFileExtensions: [
      'ts',
      'js'
    ],
    testRegex: '/__tests__/',
    rootDir: '../../',
    setupFiles: [
      './scripts/jest/compat-setup.js'
    ],
    setupTestFrameworkScriptFile: './scripts/jest/expect-compat-extensions.js',
    transform: {
      '.*': './scripts/jest/compat-preprocessor.js'
    }
  }