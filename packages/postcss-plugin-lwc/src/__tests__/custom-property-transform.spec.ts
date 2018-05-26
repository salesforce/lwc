import { process } from './shared';

describe('var transform', () => {
    it('should handle single variables in declaration value', async () => {
        const { css } = await process('div { color: var(--lwc-color); }');

        expect(css).toBe(
            'div[x-foo_tmpl] { color: $VAR(--lwc-color)$; }',
        );
    });

    it('should handle default value', async () => {
        const { css } = await process('div { color: var(--lwc-color, black); }');

        expect(css).toBe(
            'div[x-foo_tmpl] { color: $VAR(--lwc-color, black)$; }',
        );
    });

    it('should handle variables with tails', async () => {
        const { css } = await process(
            'div { color: var(--lwc-color) important; }',
        );

        expect(css).toBe(
            'div[x-foo_tmpl] { color: $VAR(--lwc-color)$ important; }',
        );
    });

    it('should handle multiple variables in a single declaration value', async () => {
        const { css } = await process(
            'div { color: var(--lwc-color), var(--lwc-other); }',
        );

        expect(css).toBe(
            'div[x-foo_tmpl] { color: $VAR(--lwc-color)$, $VAR(--lwc-other)$; }',
        );
    });

    it('should handle function in default value', async () => {
        const { css } = await process(
            'div { border: var(--border, 1px solid rgba(0, 0, 0, 0.1)); }',
        );

        expect(css).toBe(
            'div[x-foo_tmpl] { border: $VAR(--border, 1px solid rgba(0, 0, 0, 0.1))$; }',
        );
    });

    it('should handle multiple variable in a function', async () => {
        const { css } = await process(
            'div { background: linear-gradient(to top, var(--lwc-color), var(--lwc-other)); }',
        );

        expect(css).toBe(
            'div[x-foo_tmpl] { background: linear-gradient(to top, $VAR(--lwc-color)$, $VAR(--lwc-other)$); }',
        );
    });

    it('should handle nested var', async () => {
        const { css } = await process(
            'div { background: var(--lwc-color, var(--lwc-other, black)); }',
        );

        expect(css).toBe(
            'div[x-foo_tmpl] { background: $VAR(--lwc-color, $VAR(--lwc-other, black)$)$; }',
        );
    });
});
