import { describe, it, expect } from 'vitest';
import {
    serverSideRenderComponent,
    renderAttrsNoYield,
    addSlottedContent,
    RenderContext,
    renderAttrs,
    fallbackTmpl,
    fallbackTmplNoYield,
} from '../render';
import { SYMBOL__GENERATE_MARKUP, LightningElement } from '../lightning-element';
import type { Attributes } from '../types';

describe('render.ts internals', () => {
    const createMockElement = (className: string = ''): LightningElement =>
        ({ className }) as unknown as LightningElement;

    describe('renderAttrsNoYield', () => {
        it('should handle null and undefined attributes', () => {
            const mockEl = createMockElement();
            const attrs = {
                title: null,
                'data-foo': undefined,
                'aria-label': 'test',
            } as unknown as Attributes;

            const result = renderAttrsNoYield(mockEl, attrs, undefined, undefined);
            expect(result).toContain(' title');
            expect(result).toContain(' data-foo');
            expect(result).toContain(' aria-label="test"');
        });

        it('should ignore invalid style attributes', () => {
            const mockEl = createMockElement();
            const attrs = { style: { color: 'red' } } as unknown as Attributes;
            const result = renderAttrsNoYield(mockEl, attrs, undefined, undefined);
            expect(result).not.toContain('style=');
        });

        it('should handle combined scope tokens in class attribute', () => {
            const mockEl = createMockElement();
            const attrs = { class: 'btn' } as unknown as Attributes;
            const result = renderAttrsNoYield(mockEl, attrs, 'host-token', 'parent-token');
            expect(result).toContain('class="btn parent-token host-token"');
        });
    });

    describe('RenderContext', () => {
        it('should handle boolean styleDedupe', () => {
            const ctx = new RenderContext(true);
            expect(ctx.styleDedupeIsEnabled).toBe(true);
        });

        it('should generate unique IDs', () => {
            const ctx = new RenderContext(false);
            expect(ctx.getNextId()).toBe(0);
            expect(ctx.getNextId()).toBe(1);
        });
    });

    describe('addSlottedContent', () => {
        it('should create a new list if the slot name does not exist', () => {
            const map: Record<string, unknown[]> = {};
            const fn = () => {};
            addSlottedContent('default', fn, map);
            expect(map).toEqual({ default: [fn] });
        });
    });

    describe('serverSideRenderComponent', () => {
        it('should render in asyncYield mode', async () => {
            const MockComponent = {
                [SYMBOL__GENERATE_MARKUP]: async function* () {
                    await Promise.resolve();
                    yield '<div>yield content</div>';
                },
            };
            const result = await serverSideRenderComponent(
                'x-mock',
                MockComponent as any,
                {},
                false,
                'asyncYield'
            );
            expect(result).toBe('<div>yield content</div>');
        });

        it('should render in async mode', async () => {
            const AsyncComponent = {
                [SYMBOL__GENERATE_MARKUP]: () => Promise.resolve('<div>async</div>'),
            };
            const result = await serverSideRenderComponent(
                'x-async',
                AsyncComponent as any,
                {},
                false,
                'async'
            );
            expect(result).toBe('<div>async</div>');
        });

        it('should render in sync mode', async () => {
            const SyncComponent = {
                [SYMBOL__GENERATE_MARKUP]: () => '<div>sync</div>',
            };
            const result = await serverSideRenderComponent(
                'x-sync',
                SyncComponent as any,
                {},
                false,
                'sync'
            );
            expect(result).toBe('<div>sync</div>');
        });

        it('should throw an error for invalid tagName', async () => {
            await expect(serverSideRenderComponent(123 as any, {} as any)).rejects.toThrow(
                'tagName must be a string, found: 123'
            );
        });

        it('should throw an error for invalid mode', async () => {
            const MockComponent = { [SYMBOL__GENERATE_MARKUP]: () => 'html' };
            await expect(
                serverSideRenderComponent(
                    'x-cmp',
                    MockComponent as any,
                    {},
                    false,
                    'invalid-mode' as any
                )
            ).rejects.toThrow('Invalid mode: invalid-mode');
        });

        it('should render fallback if generateMarkup is missing', async () => {
            class EmptyComponent extends LightningElement {}
            const result = await serverSideRenderComponent('x-empty', EmptyComponent as any);
            expect(result).toBe('<x-empty></x-empty>');
        });
    });

    describe('fallback templates', () => {
        it('fallbackTmplNoYield should handle shadow content', () => {
            const mockCmp = { renderMode: 'shadow' } as any;
            const mockShadowContent = () => 'shadow-stuff';
            const result = fallbackTmplNoYield(
                mockShadowContent,
                null,
                null,
                mockCmp,
                {} as any,
                {} as any
            );
            expect(result).toBe('<template shadowrootmode="open"></template>shadow-stuff');
        });

        it('fallbackTmpl async generator should handle shadow content', async () => {
            const mockCmp = { renderMode: 'shadow' } as any;
            const mockShadowContent = async function* () {
                await Promise.resolve();
                yield 'async-shadow';
            };
            const gen = fallbackTmpl(mockShadowContent, null, null, mockCmp, {} as any, {} as any);
            let result = '';
            for await (const segment of gen) {
                result += segment;
            }
            expect(result).toBe('<template shadowrootmode="open"></template>async-shadow');
        });

        it('should render in light mode (no shadow root)', async () => {
            class LightComponent extends LightningElement {
                static renderMode = 'light' as const;
                static [SYMBOL__GENERATE_MARKUP] = () => '<div>light</div>';
            }
            const result = await serverSideRenderComponent('x-light', LightComponent as any);
            expect(result).toBe('<div>light</div>');
        });
    });

    describe('renderAttrs generator', () => {
        it('should yield attributes as a generator', () => {
            const mockEl = createMockElement('');
            const attrs = { title: 'hello', class: 'bar' } as unknown as Attributes;
            const gen = renderAttrs(mockEl, attrs, undefined, undefined);

            let result = '';
            for (const value of gen) {
                result += value;
            }

            expect(result).toContain('title="hello"');
            expect(result).toContain('class="bar"');
        });
    });
});
