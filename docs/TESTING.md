## Writing JavaScript Tests for Raptor 

Before you start writing tests for raptor, make sure you're well-versed with:

 * [Jest](http://facebook.github.io/jest/)
 * [Mocha](https://mochajs.org/)
 * [power-assert](https://github.com/power-assert-js/power-assert)
 * [sinon](http://sinonjs.org/)

### What Should I Test?

At the moment, we don't interact with the DOM directly very often, mostly we rely on snabbdom, which contains its own test suite. Therefore, we are more focused on testing the internals of the Raptor Engine and Raptor Services than testing the DOM interactions.

 * TBD
 
### Best Practices

 * TBD

## Test Runner

The chosen test-runner for this project is [Jest](http://facebook.github.io/jest/), which relies on jsdom under the hood. 

### Run tests

The following command will execute the default test suite, which includes code coverage and it is in verbose mode by default:

```bash
npm test
```
