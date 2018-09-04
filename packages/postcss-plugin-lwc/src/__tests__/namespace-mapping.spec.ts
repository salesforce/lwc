import { process, DEFAULT_TOKEN } from './shared';

const NO_CUSTOM_PROPERTY_CONFIG = {
    token: DEFAULT_TOKEN,
    namespaceMapping: {
        c: 'nsC',
    },
};

describe('namespace mapping', () => {
    it('should transform standard tag selector', async () => {
        const { css } = await process('c-foo {}', NO_CUSTOM_PROPERTY_CONFIG);
        expect(css).toBe(`nsC-foo[x-foo_tmpl],[is=\"nsC-foo\"][x-foo_tmpl] {}`);
    });

    it('should transform standard tag selector in complex selectors', async () => {
        const { css } = await process('header c-foo, div, c-bar {}', NO_CUSTOM_PROPERTY_CONFIG);
        expect(css).toBe(
            `header[x-foo_tmpl] nsC-foo[x-foo_tmpl], div[x-foo_tmpl],nsC-bar[x-foo_tmpl],[is=\"nsC-bar\"][x-foo_tmpl],header[x-foo_tmpl] [is=\"nsC-foo\"][x-foo_tmpl] {}`
        );
    });

    it('should transform tag selector in compound selectors', async () => {
        const { css } = await process('c-foo.bar {}', NO_CUSTOM_PROPERTY_CONFIG);
        expect(css).toBe(`nsC-foo.bar[x-foo_tmpl],[is=\"nsC-foo\"].bar[x-foo_tmpl] {}`);
    });

    it('should transform tag selector in media queries', async () => {
        const { css } = await process('@media screen and (min-width: 900px) { c-foo {} }', NO_CUSTOM_PROPERTY_CONFIG);
        expect(css).toBe(`@media screen and (min-width: 900px) { nsC-foo[x-foo_tmpl],[is=\"nsC-foo\"][x-foo_tmpl] {} }`);
    });
});
