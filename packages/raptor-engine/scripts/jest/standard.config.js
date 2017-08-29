module.exports = {
    moduleFileExtensions: [
      'ts',
      'js'
    ],
    testRegex: '/__tests__/',
    rootDir: '../../',
    setupTestFrameworkScriptFile: './scripts/jest/expect-standard-extensions.js',
    transform: {
      '.*': require.resolve('ts-jest/preprocessor.js')
    }
  }