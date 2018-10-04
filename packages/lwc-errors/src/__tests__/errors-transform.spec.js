import { stripIndents } from 'common-tags';
const babel = require('@babel/core');
const baseConfig = { babelrc: false, filename: 'test.js' };

const plugin = require('../errors-transform');

function test(actual, expected) {
    const transformed = babel.transform(actual, {plugins: [plugin]});
    const normalizedOutput = stripIndents(transformed.code);
    const normalizedExpected = stripIndents(expected);

    expect(normalizedOutput).toEqual(normalizedExpected);
}

describe('test', () => {

    it('test', () => {
        test(
            `invariant(condition, CompilerErrors.PARSER_BOOLEAN_ATTRIBUTE_TRUE, [tag, name, value]);`,
            `
            if (!condition) {
                if (process.env.NODE_ENV !== "production") {
                    invariant(false, key, ['attribute']);
                } else {
                    PROD_INVARIANT(1001, ['attribute']);
                }
            }
            `
        )
    });
});
