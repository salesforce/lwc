import postcss from 'postcss';

import { transformSelector } from '../index';
import { process, DEFAULT_TOKEN } from './shared';

describe('default export (postcss plugin)', () => {
    it('assert token option', () => {
        expect(() => process('', { })).toThrow(
            /token option must be a string but instead received undefined/,
        );
    });

    it('transform selectors', async () => {
        const { css } = await process(
            ':host { display: block; } h1 { color: red; }',
        );
        expect(css).toBe(
            `[x-foo_tmpl-host] { display: block; } h1[x-foo_tmpl] { color: red; }`,
        );
    });
});

describe('transformSelector', () => {
    it('transforms string selector', () => {
        const res = transformSelector(':host', {
            token: DEFAULT_TOKEN,
        });
        expect(res).toBe('[x-foo_tmpl-host]');
    });

    it('transforms postCSS node rules', () => {
        const res = transformSelector(
            postcss.rule({
                selector: ':host',
            }),
            { token: DEFAULT_TOKEN },
        );
        expect(res).toBe('[x-foo_tmpl-host]');
    });
});
