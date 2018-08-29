import { transform } from '../transformer';
import { pretify } from '../../__tests__/utils';

const config = {
    namespaceMapping: { c: 'namespace' },
    namespace: 'c',
    name: 'foo',
}

describe('transform namespaced components', async () => {
    it('should apply namespace transformation to css', async () => {
        const actual = `c-foo { color: red; }`;
        const expected = `
            function style(token) {
                return \`namespace-foo[\${token}],[is="namespace-foo"][\${token}] { color: red; }\`;
            }
            export default style;
        `;

        const { code } = await transform(actual, 'foo.css', config);
        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should apply namespace transformation to css with multiple class references', async () => {
        const actual = `header c-foo, div, c-bar { color: red; }`;
        const expected = `
            function style(token) {
                return \`header[\${token}] namespace-foo[\${token}], div[\${token}], namespace-bar[\${token}],[is="namespace-bar"][\${token}],header[\${token}] [is="namespace-foo"][\${token}] { color: red; }\`;
            }
            export default style;
        `;
        const { code } = await transform(actual, 'foo.css', config);
        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should apply namespace transformation to css with multiple rules', async () => {
        const actual = `x-foo {\ncolor: red;\n }\n \nx-bar {\ncolor: red;\n}`;
        const expected =
            `function style(token) {
                return \`x-foo[\${token}],[is="x-foo"][\${token}] {
            color: red;
            }

            x-bar[\${token}],[is="x-bar"][\${token}] {
            color: red;
            }\`;
            }
            export default style;
        `;

        const { code } = await transform(actual, 'foo.css', 'x', 'ns');
        expect(pretify(code)).toBe(pretify(expected));
    });
});
