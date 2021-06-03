describe('shadowRoot instanceof', () => {
    it('shadowRoot should have instanceof ShadowRoot === true', () => {
        const el = document.createElement('div');
        const shadowRoot = el.attachShadow({ mode: 'open' });
        expect(shadowRoot instanceof ShadowRoot).toEqual(true);
        expect(document.createElement('div') instanceof ShadowRoot).toEqual(false);
        expect(document.createDocumentFragment() instanceof ShadowRoot).toEqual(false);
        expect(undefined instanceof ShadowRoot).toEqual(false);
        expect(null instanceof ShadowRoot).toEqual(false);
    });
});
