import { transform } from '../../transformers/transformer';
import { pretify } from '../../__tests__/utils';

describe('transform', () => {
    it('should apply namespace transformation to html file', async () => {
        const actual = `
            <template>
                <c-foo></c-foo>
            </template>
        `;

        const expected = `
            import stylesheet from './foo.css'
            import _namespaceFoo from \"namespace-foo\";
            export default function tmpl($api, $cmp, $slotset, $ctx) {
                const {
                    c: api_custom_element
                } = $api;
                return [api_custom_element(\"namespace-foo\", _namespaceFoo, {
                    key: 1
                }, [])];
            }
            if (stylesheet) {
                tmpl.hostToken = 'namespace-foo_foo-host';
                tmpl.shadowToken = 'namespace-foo_foo';
                const style = document.createElement('style');
                style.type = 'text/css';
                style.dataset.token = 'namespace-foo_foo'
                style.textContent = stylesheet('namespace-foo_foo');
                document.head.appendChild(style);
            }
        `;
        const { code } = await transform(actual, 'foo.html', {
            namespace: 'namespace',
            name: 'foo',
        });
        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should not apply namespace transformation if its value is not provided', async () => {
        const actual = `
            <template>
                <c-foo></c-foo>
            </template>
        `;

        const expected = `
        import stylesheet from './foo.css'
        import _cFoo from \"c-foo\";
        export default function tmpl($api, $cmp, $slotset, $ctx) {
            const {
            c: api_custom_element
            } = $api;
            return [api_custom_element(\"c-foo\", _cFoo, {
            key: 1
            }, [])];
        }
        if (stylesheet) {
            tmpl.hostToken = 'c-foo_foo-host';
            tmpl.shadowToken = 'c-foo_foo';
            const style = document.createElement('style');
            style.type = 'text/css';
            style.dataset.token = 'c-foo_foo'
            style.textContent = stylesheet('c-foo_foo');
            document.head.appendChild(style);
        }
        `;
        const { code } = await transform(actual, 'foo.html', {
            name: 'foo',
        });
        expect(pretify(code)).toBe(pretify(expected));
    });
});
