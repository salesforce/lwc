import { afterEach, describe, expect, it, vi } from 'vitest';

class FakeCSSStyleSheet {
    content = '';

    replaceSync(cssText: string) {
        this.content = cssText;
    }
}

function setAdoptedStyleSheets(
    root: Document | ShadowRoot,
    stylesheets: FakeCSSStyleSheet[] = []
): FakeCSSStyleSheet[] {
    Object.defineProperty(root, 'adoptedStyleSheets', {
        configurable: true,
        value: stylesheets,
        writable: true,
    });

    return stylesheets;
}

async function ensureRegistered() {
    const { registerLwcStyleComponent } = await import('../index');

    if (!customElements.get('lwc-style')) {
        registerLwcStyleComponent();
    }
}

describe('@lwc/ssr-client-utils', () => {
    afterEach(() => {
        document.head.innerHTML = '';
        document.body.innerHTML = '';
        (window as any).__lwcClearStylesheetCache?.();
        vi.unstubAllGlobals();
    });

    it('exposes the stylesheet cache reset helper during integration tests', async () => {
        vi.resetModules();
        process.env.NODE_ENV = 'test-lwc-integration';

        await import('../index');

        expect((window as any).__lwcClearStylesheetCache).toEqual(expect.any(Function));
    });

    it('registers the custom element and deduplicates repeated stylesheets', async () => {
        vi.stubGlobal('CSSStyleSheet', FakeCSSStyleSheet);
        await ensureRegistered();

        const adoptedStyleSheets = setAdoptedStyleSheets(document);
        const style = document.createElement('style');
        style.id = 'shared-style';
        style.textContent = 'p { color: red; }';
        document.head.appendChild(style);

        const firstStyleMarker = document.createElement('lwc-style');
        firstStyleMarker.setAttribute('style-id', 'shared-style');
        document.body.appendChild(firstStyleMarker);

        expect(document.body.querySelector('lwc-style')).toBeNull();
        expect(adoptedStyleSheets).toHaveLength(0);

        const secondStyleMarker = document.createElement('lwc-style');
        secondStyleMarker.setAttribute('style-id', 'shared-style');
        secondStyleMarker.className = 'scoped token';
        document.body.appendChild(secondStyleMarker);

        expect(adoptedStyleSheets).toHaveLength(1);
        expect(adoptedStyleSheets[0]).toMatchObject({
            content: 'p { color: red; }',
        });

        const placeholder = document.body.querySelector('style[type="text/css"]');
        expect(placeholder).not.toBeNull();
        expect([...placeholder!.classList]).toEqual(['scoped', 'token']);
    });

    it('throws when connected without a style-id attribute', async () => {
        await ensureRegistered();
        const styleMarker = document.createElement('lwc-style');
        const connectedCallback = (styleMarker as HTMLElement & { connectedCallback(): void })
            .connectedCallback;

        expect(() => connectedCallback.call(styleMarker)).toThrow(
            '"style-id" attribute must be supplied for <lwc-style> element'
        );
    });

    it('throws when the matching style tag is missing', async () => {
        await ensureRegistered();
        setAdoptedStyleSheets(document);

        const styleMarker = document.createElement('lwc-style');
        styleMarker.setAttribute('style-id', 'missing-style');
        Object.defineProperty(styleMarker, 'getRootNode', {
            configurable: true,
            value: () => document,
        });
        const connectedCallback = (styleMarker as HTMLElement & { connectedCallback(): void })
            .connectedCallback;

        expect(() => connectedCallback.call(styleMarker)).toThrow(
            '<lwc-style> tag found with no corresponding <style id="missing-style"> tag'
        );
    });
});
