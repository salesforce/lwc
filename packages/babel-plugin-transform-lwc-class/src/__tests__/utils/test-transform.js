const babel = require('@babel/core');
const { stripIndents } = require('common-tags');

const BASE_CONFIG = { babelrc: false, filename: 'test.js' };

function transform(plugin, opts = {}) {
    const testConfig = Object.assign({}, BASE_CONFIG, {
        plugins: [plugin]
    }, opts);

    return function(source) {
        return babel.transform(prettify(source), testConfig);
    };
}

function prettify(str) {
    return str.toString()
        .replace(/^\s+|\s+$/, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length)
        .join('\n');
}

function pluginTest(plugin, opts = {}) {
    const testTransform = transform(plugin, opts);

    const transformTest = function(actual, expected) {
        if (expected.error) {
            let transformError;

            try {
                testTransform(actual);
            } catch (error) {
                transformError = error;
            }

            expect(transformError.toString()).toContain(expected.error.message);
        } else if (expected.output) {
            const output = testTransform(actual);
            if (expected.output.code) {
                const normalizedActual = output && output.code && stripIndents(output.code);
                const normalizedExpected = stripIndents(expected.output.code);
                expect(normalizedActual).toBe(normalizedExpected);
            }
            if (expected.output.metadata) {
                expect(output.metadata).toEqual(expected.output.metadata);
            }
        } else {
            throw new TypeError(`Transform test expect an object with either error or output.`);
        }
    };

    const pluginTester = (name, actual, expected) => test(name, () => transformTest(actual, expected));
    pluginTester.only = (name, actual, expected) => test.only(name, () => transformTest(actual, expected));
    pluginTester.skip = (name) => test.skip(name);

    return pluginTester;
}

module.exports.pluginTest = pluginTest;
module.exports.transform = transform;
