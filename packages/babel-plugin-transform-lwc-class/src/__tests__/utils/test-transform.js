const babel = require('babel-core');

const test = it;

const baseConfig = {
    babelrc: false,
    filename: 'test.js',
    parserOpts: {
        plugins: ['*'],
    },
};

function transform(plugin, opts = {}) {
    const testConfig = Object.assign({}, baseConfig, {
        plugins: [plugin]
    }, opts);

    return function(source) {
        return babel.transform(prettify(source), testConfig);
    }
}

function errorFromObject(obj) {
    const error = new Error(obj.message);

    for (let key in obj) {
        if (key !== 'message') {
            error[key] = obj[key];
        }
    }

    return error;
}

function prettify(str) {
    return str.toString()
        .replace(/^\s+|\s+$/, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length)
        .join('\n');
}

function makeTransformTest(plugin, opts = {}) {
    const testTransform = transform(plugin, opts);

    const transformTest = function(actual, expected) {
        if (expected.error) {
            let transformError;

            try {
                testTransform(actual);
            } catch (error) {
                transformError = error;
            }

            expect(transformError).toMatchObject(errorFromObject(expected.error));
        } else if (expected.output) {
            const output = testTransform(actual);

            expect(output.code).toBe(output.code);
            expect(output.metadata).toEqual(output.metadata);
        } else {
            throw new TypeError(`Transform test expect an object with either error or output.`);
        }
    }

    const transformTester = (name, actual, expected) => test(name, () => transformTest(actual, expected));
    transformTester.only = (name, actual, expected) => test.only(name, () => transformTest(actual, expected));
    transformTester.skip = (name) => test.skip(name);

    return transformTester;
}



module.exports.transformTest = makeTransformTest;
module.exports.transform = transform;
