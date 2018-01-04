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
        return babel.transform(pretify(source), testConfig);
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

function pretify(str) {
    return str.toString()
        .replace(/^\s+|\s+$/, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length)
        .join('\n');
}

function makeTest(plugin, opts = {}) {
    const testTransform = transform(plugin, opts);

    const pluginTest = function(name, source, expectedSource, expectedError, expectedMetadata) {
        test(name, () => {
            let res;
            let err;

            try {
                res = testTransform(source);
            } catch (error) {
                err = error;
            }

            if (err) {
                /* istanbul ignore next */
                if (!expectedError) {
                    throw err;
                }

                expect(err).toMatchObject(errorFromObject(expectedError));
            } else {
                if (expectedSource) {
                    expect(pretify(res.code)).toBe(pretify(expectedSource));
                }
                if (expectedMetadata) {
                    expect(res.metadata).toMatchObject(expectedMetadata);
                }
            }
        });
    }

    /* istanbul ignore next */
    pluginTest.skip = (name) => test.skip(name);

    return pluginTest;
}



module.exports.test = makeTest;
module.exports.transform = transform;
