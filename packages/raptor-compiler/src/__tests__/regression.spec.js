const { compile } = require('../index');
const { pretify } = require('./test-utils');

describe('resgression test', () => {
    it('#743 - Object rest spread throwing', async () => {
        const actual = `const base = { foo: true }; const res = { ...base, bar: false };`;
        const expected = `const base = { foo: true };const res = Object.assign({}, base, { bar: false });`;

        const { code } = await compile('/x/foo/foo.js', {
            sources: {
                '/x/foo/foo.js': actual,
            },
        });

        expect(pretify(code)).toBe(pretify(expected));
    });
});
