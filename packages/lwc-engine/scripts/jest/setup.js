const chalk = require('chalk');
const { CONSOLE_WHITELIST } = require('./test-whitelist');

// Extract original methods from console
const { warn, error } = console;

const consoleOverride = methodName => () => {
    const message = [
        `Expect test not to call ${chalk.red.bold(`console.${methodName}()`)}.\n`,
        `If the message expected, make sure you mock the console method in your test.\n`,
    ].join('\n');

    throw new Error(message);
};

jasmine.getEnv().addReporter({
    // Hook called before the "it" or "test" function and the associated "beforeEach"
    // functions get invoked.
    specStarted(spec) {
        const { fullName } = spec;

        const isWhitelistedTest = CONSOLE_WHITELIST.includes(fullName);
        if (!isWhitelistedTest) {
            console.warn = consoleOverride('warn');
            console.error = consoleOverride('error');
        }
    },

    // Hook called before the "it" or "test" function and the associated "afterEach"
    // functions get invoked.
    specDone() {
        console.warn = warn;
        console.error = error;
    },
});
