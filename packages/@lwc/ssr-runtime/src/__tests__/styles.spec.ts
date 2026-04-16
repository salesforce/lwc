import { describe, it, expect } from 'vitest';
import { renderStylesheets, hasScopedStaticStylesheets } from '../styles';
import { RenderContext } from '../render';
import type { Stylesheet } from '@lwc/shared';
import type { LightningElementConstructor } from '../lightning-element';

describe('styles.ts internals', () => {
    const createMockStylesheet = (content: string, isScoped: boolean = false): Stylesheet => {
        const sheet = () => content;
        sheet.$scoped$ = isScoped;
        return sheet as Stylesheet;
    };

    describe('hasScopedStaticStylesheets', () => {
        it('returns false if no stylesheets are scoped', () => {
            const MockComponent = {
                stylesheets: [createMockStylesheet('.foo {}', false)],
            } as unknown as LightningElementConstructor;

            expect(hasScopedStaticStylesheets(MockComponent)).toBe(false);
        });

        it('returns true if any stylesheet is scoped', () => {
            const MockComponent = {
                stylesheets: [
                    createMockStylesheet('.foo {}', false),
                    createMockStylesheet('.bar {}', true),
                ],
            } as unknown as LightningElementConstructor;

            expect(hasScopedStaticStylesheets(MockComponent)).toBe(true);
        });
    });

    describe('renderStylesheets', () => {
        it('renders standard styles without deduplication', () => {
            const ctx = new RenderContext(false);
            const sheet = createMockStylesheet('.foo { color: red; }');
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

            expect(result).toBe('<style type="text/css">.foo { color: red; }</style>');
        });

        it('renders initial deduplicated style block with IDs', () => {
            const ctx = new RenderContext('test-prefix');
            const sheet = createMockStylesheet('.foo { color: red; }');
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
            expect(result).toContain('.foo { color: red; }');
        });

        it('renders only the marker tag when deduplication hits an existing sheet', () => {
            const ctx = new RenderContext('test-prefix');
            const sheet = createMockStylesheet('.foo { color: red; }');
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
            expect(result2).not.toContain('.foo { color: red; }');
        });

        it('injects scope token class if component has scoped styles', () => {
            const ctx = new RenderContext(false);
            const sheet = createMockStylesheet('.foo { color: red; }', true);
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
