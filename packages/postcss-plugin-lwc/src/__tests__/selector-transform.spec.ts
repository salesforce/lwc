import * as postcss from 'postcss';
import lwcPlugin from '../index';

const FILE_NAME = '/test.css';
const DEFAULT_TAGNAME = 'x-foo';
const DEFAULT_TOKEN = 'x-foo_tmpl';

function process(
    source: string,
    options: any = { tagName: DEFAULT_TAGNAME, token: DEFAULT_TOKEN },
) {
    const plugins = [lwcPlugin(options)];
    return postcss(plugins).process(source, { from: FILE_NAME });
}

describe('validate options', () => {
    it('assert tagName option', () => {
        expect(() => process('', {})).toThrow(
            /tagName option must be a string but instead received undefined/,
        );
    });

    it('assert token option', () => {
        expect(() => process('', { tagName: DEFAULT_TAGNAME })).toThrow(
            /token option must be a string but instead received undefined/,
        );
    });
});

describe('selectors', () => {
    it('should handle element selector', async () => {
        const { css } = await process('h1 {}');
        expect(css).toBe(`h1[x-foo_tmpl] {}`);
    });

    it('should handle pseudo element', async () => {
        const { css } = await process('ul li:first-child a {}');
        expect(css).toBe(
            `ul[x-foo_tmpl] li[x-foo_tmpl]:first-child a[x-foo_tmpl] {}`,
        );
    });

    it('should handle multiple selectors', async () => {
        const { css } = await process('h1, h2 {}');
        expect(css).toBe(`h1[x-foo_tmpl], h2[x-foo_tmpl] {}`);
    });

    it('should handle line returns in selector', async () => {
        const { css } = await process('h1,\n h2 {}');
        expect(css).toBe(`h1[x-foo_tmpl],\n h2[x-foo_tmpl] {}`);
    });

    it('should handle media queries', async () => {
        const { css } = await process(
            '@media screen and (min-width: 900px) { h1 {} }',
        );
        expect(css).toBe(
            `@media screen and (min-width: 900px) { h1[x-foo_tmpl] {} }`,
        );
    });

    it('should handle support queries', async () => {
        const { css } = await process(
            `@supports (display: flex) { section {} }`,
        );
        expect(css).toBe(
            `@supports (display: flex) { section[x-foo_tmpl] {} }`,
        );
    });

    it('should handle complex CSS selectors', async () => {
        let res;

        res = await process('h1::before {}');
        expect(res.css).toBe(`h1[x-foo_tmpl]::before {}`);

        res = await process('h1 > a {}');
        expect(res.css).toBe(`h1[x-foo_tmpl] > a[x-foo_tmpl] {}`);

        res = await process('h1 + a {}');
        expect(res.css).toBe(`h1[x-foo_tmpl] + a[x-foo_tmpl] {}`);

        res = await process('div.active > p {}');
        expect(res.css).toBe(`div.active[x-foo_tmpl] > p[x-foo_tmpl] {}`);

        res = await process('div[attr="value"] {}');
        expect(res.css).toBe(`div[attr="value"][x-foo_tmpl] {}`);

        res = await process('div[attr="va lue"] {}');
        expect(res.css).toBe(`div[attr="va lue"][x-foo_tmpl] {}`);
    });
});

describe('custom-element', () => {
    it('should handle custom element', async () => {
        const { css } = await process('x-bar {}');
        expect(css).toBe(`x-bar[x-foo_tmpl],[is="x-bar"][x-foo_tmpl] {}`);
    });

    it('should handle nested custom element', async () => {
        const { css } = await process('x-bar x-baz {}');
        expect(css).toBe(
            [
                `x-bar[x-foo_tmpl] x-baz[x-foo_tmpl],[is="x-bar"][x-foo_tmpl] x-baz[x-foo_tmpl],`,
                `x-bar[x-foo_tmpl] [is="x-baz"][x-foo_tmpl],[is="x-bar"][x-foo_tmpl] [is="x-baz"][x-foo_tmpl] {}`,
            ].join(''),
        );
    });

    it('should handle custom elements in the :host-context selector', async () => {
        const { css } = await process(':host-context(x-bar) {}');
        expect(css).toBe(
            [
                `x-bar x-foo[x-foo_tmpl],x-bar [is="x-foo"][x-foo_tmpl],`,
                `[is="x-bar"] x-foo[x-foo_tmpl],[is="x-bar"] [is="x-foo"][x-foo_tmpl] {}`,
            ].join(''),
        );
    });
});

describe(':host', () => {
    it('should handle no context', async () => {
        const { css } = await process(':host {}');
        expect(css).toBe(`x-foo[x-foo_tmpl],[is="x-foo"][x-foo_tmpl] {}`);
    });

    it('should handle class', async () => {
        const { css } = await process(':host(.active) {}');
        expect(css).toBe(
            `x-foo[x-foo_tmpl].active,[is="x-foo"][x-foo_tmpl].active {}`,
        );
    });

    it('should handle attribute', async () => {
        const { css } = await process(':host([disabled]) {}');
        expect(css).toBe(
            `x-foo[x-foo_tmpl][disabled],[is="x-foo"][x-foo_tmpl][disabled] {}`,
        );
    });

    it('should handle multiple selectors', async () => {
        const { css } = await process(':host(.a, .b) > p {}');
        expect(css).toBe(
            [
                `x-foo[x-foo_tmpl].a > p[x-foo_tmpl],[is="x-foo"][x-foo_tmpl].a > p[x-foo_tmpl],`,
                `x-foo[x-foo_tmpl].b > p[x-foo_tmpl],[is="x-foo"][x-foo_tmpl].b > p[x-foo_tmpl] {}`,
            ].join(''),
        );
    });

    it('should handle pseudo-element', async () => {
        const { css } = await process(':host(:hover) {}');
        expect(css).toBe(
            `x-foo[x-foo_tmpl]:hover,[is="x-foo"][x-foo_tmpl]:hover {}`,
        );
    });
});

describe(':host-context', () => {
    it('should handle selector', async () => {
        const { css } = await process(':host-context(.darktheme) {}');
        expect(css).toBe(
            `.darktheme x-foo[x-foo_tmpl],.darktheme [is="x-foo"][x-foo_tmpl] {}`,
        );
    });

    it('should handle multiple selectors', async () => {
        const { css } = await process(
            ':host-context(.darktheme, .nighttheme) {}',
        );
        expect(css).toBe(
            [
                `.darktheme x-foo[x-foo_tmpl],.darktheme [is="x-foo"][x-foo_tmpl],`,
                `.nighttheme x-foo[x-foo_tmpl],.nighttheme [is="x-foo"][x-foo_tmpl] {}`,
            ].join(''),
        );
    });

    it('should handle getting associated with host', async () => {
        const { css } = await process(':host-context(.darktheme):host {}');
        expect(css).toBe(
            `.darktheme x-foo[x-foo_tmpl],.darktheme [is="x-foo"][x-foo_tmpl] {}`,
        );
    });
});

describe('deprecated', () => {
    it('throws on deprecated /deep/ selector', () => {
        return expect(process(':host /deep/ a {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Invalid usage of deprecated \/deep\/ selector/,
            ),
            file: FILE_NAME,
            line: 1,
            column: 7,
        });
    });

    it('throws on deprecated ::shadow pseudo-element selector', () => {
        return expect(process(':host::shadow a {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /Invalid usage of deprecated ::shadow selector/,
            ),
            file: FILE_NAME,
            line: 1,
            column: 6,
        });
    });

    it('throws on unsupported ::slotted pseudo-element selector', () => {
        return expect(process('::slotted a {}')).rejects.toMatchObject({
            message: expect.stringMatching(
                /::slotted pseudo-element selector is not supported/,
            ),
            file: FILE_NAME,
            line: 1,
            column: 1,
        });
    });
});
