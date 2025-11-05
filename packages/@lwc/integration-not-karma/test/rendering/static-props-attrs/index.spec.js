import { createElement } from 'lwc';
import Component from 'x/component';

describe('static props and attrs', () => {
    beforeAll(() => {
        customElements.define(
            'x-external-with-static-props',
            class extends HTMLElement {
                prop = 'default';
                constructor() {
                    super();
                }
            }
        );
    });

    // This test triggers various optimizations for static data bags (props and attrs).
    // In particular, there is code like this in the diffing algo:
    //
    //     if (oldAttrs === attrs) { return; }
    //
    // ...which will skip the diffing if the two objects are the same, which can only happen
    // if they were statically hoisted by the compiler.
    // The point of the dynamic class is to just ensure the whole vnode is not static (which
    // triggers the static vnode optimization), and to trigger a re-render.
    // Classes are treated differently from other attributes.
    it('should render correctly with static props and attrs but dynamic class', async () => {
        const elm = createElement('x-component', { is: Component });
        elm.dynamic = 'first';
        document.body.appendChild(elm);

        await Promise.resolve();

        const div = elm.shadowRoot.querySelector('div');
        const otherElm = elm.shadowRoot.querySelector('x-other');
        const externalElm = elm.shadowRoot.querySelector('x-external-with-static-props');

        // Test initial state of props and attrs
        expect(div.getAttribute('title')).toBe('static');
        expect(div.getAttribute('aria-label')).toBe('static');
        expect(div.getAttribute('class')).toBe('first');

        expect(otherElm.getAttribute('title')).toBe('static');
        expect(otherElm.prop).toBe('static');
        expect(otherElm.getAttribute('class')).toBe('first');

        expect(externalElm.getAttribute('title')).toBe('static');
        expect(externalElm.prop).toBe('static');
        expect(externalElm.hasAttribute('prop')).toBe(false);
        expect(externalElm.getAttribute('not-a-prop')).toBe('static');
        expect(externalElm.getAttribute('class')).toBe('first');

        // Trigger re-render
        elm.dynamic = 'second';

        await Promise.resolve();

        // Regular <div> - attributes
        expect(div.getAttribute('title')).toBe('static');
        expect(div.getAttribute('aria-label')).toBe('static');
        expect(div.getAttribute('class')).toBe('second');

        // Other LWC component - props
        expect(otherElm.getAttribute('title')).toBe('static');
        expect(otherElm.prop).toBe('static');
        expect(otherElm.getAttribute('class')).toBe('second');

        // External web component - props and attrs
        expect(externalElm.getAttribute('title')).toBe('static');
        expect(externalElm.prop).toBe('static');
        expect(externalElm.hasAttribute('prop')).toBe(false);
        expect(externalElm.getAttribute('not-a-prop')).toBe('static');
        expect(externalElm.getAttribute('class')).toBe('second');
    });
});
