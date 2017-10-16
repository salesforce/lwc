module.exports = {
  moduleFileExtensions: [
    'ts',
    'js'
  ],
  rootDir: '../../',
  testRegex: '/__tests__/',
  transform: {
    '.(ts)': require.resolve('ts-jest/preprocessor.js')
  }
}