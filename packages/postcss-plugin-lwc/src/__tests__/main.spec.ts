import * as postcss from 'postcss';

import { transformSelector } from '../index';
import { process, DEFAULT_TAGNAME, DEFAULT_TOKEN } from './shared';

describe('default export (postcss plugin)', () => {
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

    it('transform selectors', async () => {
        const { css } = await process(
            ':host { display: block; } h1 { color: red; }',
        );
        expect(css).toBe(
            `x-foo[x-foo_tmpl],[is=\"x-foo\"][x-foo_tmpl] { display: block; } h1[x-foo_tmpl] { color: red; }`,
        );
    });
});

describe('transformSelector', () => {
    it('transforms string selector', () => {
        const res = transformSelector(':host', {
            tagName: DEFAULT_TAGNAME,
            token: DEFAULT_TOKEN,
        });
        expect(res).toBe('x-foo[x-foo_tmpl],[is="x-foo"][x-foo_tmpl]');
    });

    it('transforms postCSS node rules', () => {
        const res = transformSelector(
            postcss.rule({
                selector: ':host',
            }),
            { tagName: DEFAULT_TAGNAME, token: DEFAULT_TOKEN },
        );
        expect(res).toBe('x-foo[x-foo_tmpl],[is="x-foo"][x-foo_tmpl]');
    });
});
