'use strict';

const { libInstrument } = require('istanbul-api')

// Istanbul instrumenter to adapt the new instrumentation istanbul API with karma-coverage plugin.
class Instrumenter {
    constructor(...args) {
        return libInstrument.createInstrumenter(
            ...args,
        );
    }
}

module.exports = {
    Instrumenter
};
