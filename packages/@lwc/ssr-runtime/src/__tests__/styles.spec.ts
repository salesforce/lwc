import { describe, it, expect } from 'vitest';
import { transform } from '@lwc/style-compiler';

import { renderStylesheets, hasScopedStaticStylesheets } from '../styles';
import { RenderContext } from '../render';

import type { Stylesheet } from '@lwc/shared';
import type { LightningElementConstructor } from '../lightning-element';

describe('styles.ts internals', () => {
    function createCompilerStylesheet(content: string, scoped: boolean = false): Stylesheet {
        const compiled = transform(content, 'test-component', { scoped });

        const cssMatch = compiled.code.match(/return\s+["'](.*?)["']/s);
        const extractedCss = cssMatch ? cssMatch[1] : content;

        const sheet = () => extractedCss;
        sheet.$scoped$ = scoped;

        return sheet as Stylesheet;
    }

    describe('hasScopedStaticStylesheets', () => {
        it('returns false if no stylesheets are scoped', () => {
            const MockComponent = {
                stylesheets: [createCompilerStylesheet('.foo { color: red; }', false)],
            } as unknown as LightningElementConstructor;

            expect(hasScopedStaticStylesheets(MockComponent)).toBe(false);
        });

        it('returns true if any stylesheet is scoped', () => {
            const MockComponent = {
                stylesheets: [
                    createCompilerStylesheet('.foo { color: red; }', false),
                    createCompilerStylesheet('.bar { color: blue; }', true),
                ],
            } as unknown as LightningElementConstructor;

            expect(hasScopedStaticStylesheets(MockComponent)).toBe(true);
        });
    });

    describe('renderStylesheets', () => {
        it('renders standard styles without deduplication', () => {
            const ctx = new RenderContext(false);
            const sheet = createCompilerStylesheet('.foo { color: red; }');
            const MockComponent = {
                renderMode: 'shadow',
            } as unknown as LightningElementConstructor;

            const result = renderStylesheets(
                ctx,
                [sheet],
                null,
                null,
                'my-token',
                MockComponent,
                false
            );

            expect(result).toContain('<style type="text/css">');
            expect(result).toContain('.foo');
        });

        it('renders initial deduplicated style block with IDs', () => {
            const ctx = new RenderContext('test-prefix');
            const sheet = createCompilerStylesheet('.foo { color: red; }');
            const MockComponent = {
                renderMode: 'shadow',
            } as unknown as LightningElementConstructor;

            const result = renderStylesheets(
                ctx,
                [sheet],
                null,
                null,
                'my-token',
                MockComponent,
                false
            );

            expect(result).toContain('id="lwc-style-test-prefix-0"');
            expect(result).toContain('<lwc-style style-id="lwc-style-test-prefix-0"></lwc-style>');
            expect(result).toContain('.foo');
        });

        it('renders only the marker tag when deduplication hits an existing sheet', () => {
            const ctx = new RenderContext('test-prefix');
            const sheet = createCompilerStylesheet('.foo { color: red; }');
            const MockComponent = {
                renderMode: 'shadow',
            } as unknown as LightningElementConstructor;

            renderStylesheets(ctx, [sheet], null, null, 'my-token', MockComponent, false);

            const result2 = renderStylesheets(
                ctx,
                [sheet],
                null,
                null,
                'my-token',
                MockComponent,
                false
            );

            expect(result2).toBe('<lwc-style style-id="lwc-style-test-prefix-0"></lwc-style>');
            expect(result2).not.toContain('.foo');
        });

        it('injects scope token class if component has scoped styles', () => {
            const ctx = new RenderContext(false);
            const sheet = createCompilerStylesheet('.foo { color: red; }', true);
            const MockComponent = {
                renderMode: 'shadow',
                stylesheets: [sheet],
            } as unknown as LightningElementConstructor;

            const result = renderStylesheets(
                ctx,
                [sheet],
                null,
                null,
                'my-token',
                MockComponent,
                false
            );

            expect(result).toContain('<style class="my-token" type="text/css">');
        });
    });
});
