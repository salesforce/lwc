import { createElement } from 'lwc';
import Component from 'x/component';

describe('shadowRoot instanceof', () => {
    it('div.attachShadow() should have instanceof ShadowRoot === true', () => {
        const el = document.createElement('div');
        const shadowRoot = el.attachShadow({ mode: 'open' });
        document.body.appendChild(el);
        expect(shadowRoot instanceof ShadowRoot).toEqual(true);
    });

    it('element.shadowRoot should have instanceof ShadowRoot === true', () => {
        const el = createElement('x-component', { is: Component });
        document.body.appendChild(el);
        expect(el.shadowRoot instanceof ShadowRoot).toEqual(true);
    });

    it('non-shadow roots should have instanceof ShadowRoot === false', () => {
        expect(document.createElement('div') instanceof ShadowRoot).toEqual(false);
        expect(document.createDocumentFragment() instanceof ShadowRoot).toEqual(false);
        expect({} instanceof ShadowRoot).toEqual(false);
        expect(undefined instanceof ShadowRoot).toEqual(false);
        expect(null instanceof ShadowRoot).toEqual(false);
    });
});
