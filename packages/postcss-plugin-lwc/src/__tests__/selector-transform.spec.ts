import { process } from './shared';

describe('selectors', () => {
    it('should handle element selector', async () => {
        const { css } = await process('h1 {}');
        expect(css).toBe(`h1[x-foo_tmpl] {}`);
    });

    it('should handle * selectors', async () => {
        const { css } = await process('* {}');
        expect(css).toBe(`*[x-foo_tmpl] {}`);
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

        res = await process('h1 > a {}');
        expect(res.css).toBe(`h1[x-foo_tmpl] > a[x-foo_tmpl] {}`);

        res = await process('h1 + a {}');
        expect(res.css).toBe(`h1[x-foo_tmpl] + a[x-foo_tmpl] {}`);

        res = await process('div.active > p {}');
        expect(res.css).toBe(`div.active[x-foo_tmpl] > p[x-foo_tmpl] {}`);

        res = await process('div[title="value"] {}');
        expect(res.css).toBe(`div[title="value"][x-foo_tmpl] {}`);

        res = await process('div[title="va lue"] {}');
        expect(res.css).toBe(`div[title="va lue"][x-foo_tmpl] {}`);
    });
});

describe('pseudo class selectors', () => {
    it('should handle simple pseudo class selectors', async () => {
        const { css } = await process(':checked {}');
        expect(css).toBe(`:checked[x-foo_tmpl] {}`);
    });

    it('should handle complex pseudo class selectors', async () => {
        const { css } = await process('ul li:first-child a {}');
        expect(css).toBe(
            `ul[x-foo_tmpl] li:first-child[x-foo_tmpl] a[x-foo_tmpl] {}`,
        );
    });

    it('should handle functional pseudo class selectors', async () => {
        const { css } = await process(':not(p) {}');
        expect(css).toBe(`:not(p)[x-foo_tmpl] {}`);
    });
});

describe('pseudo element selectors', () => {
    it('should handle simple pseudo element selectors', async () => {
        const { css } = await process('::after {}');
        expect(css).toBe(`[x-foo_tmpl]::after {}`);
    });

    it('should handle complex pseudo element selectors', async () => {
        const { css } = await process('h1::before {}');
        expect(css).toBe(`h1[x-foo_tmpl]::before {}`);
    });
});

describe('custom-element', () => {
    it('should handle custom element', async () => {
        const { css } = await process('x-bar {}');
        expect(css).toBe(`x-bar[x-foo_tmpl] {}`);
    });
});

describe(':host', () => {
    it('should handle no context', async () => {
        const { css } = await process(':host {}');
        expect(css).toBe(`:host {}\n[x-foo_tmpl-host] {}`);
    });

    it('should handle class', async () => {
        const { css } = await process(':host(.active) {}');
        expect(css).toBe(`:host(.active) {}\n[x-foo_tmpl-host].active {}`);
    });

    it('should handle attribute', async () => {
        const { css } = await process(':host([draggable]) {}');
        expect(css).toBe(`:host([draggable]) {}\n[x-foo_tmpl-host][draggable] {}`);
    });

    it('should handle multiple selectors', async () => {
        const { css } = await process(':host(.a, .b) > p {}');
        expect(css).toBe(
            [
                `:host(.a, .b) > p[x-foo_tmpl] {}`,
                `[x-foo_tmpl-host].a > p[x-foo_tmpl],[x-foo_tmpl-host].b > p[x-foo_tmpl] {}`,
            ].join('\n')
        );
    });

    it('should handle pseudo-element', async () => {
        const { css } = await process(':host(:hover) {}');
        expect(css).toBe(`:host(:hover) {}\n[x-foo_tmpl-host]:hover {}`);
    });
});
