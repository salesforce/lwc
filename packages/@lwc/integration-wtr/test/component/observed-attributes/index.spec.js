import { createElement } from 'lwc';
import Observes from 'x/observes';

describe('observed attributes', () => {
    const constructorMethods = {
        CustomElementConstructor: () => {
            customElements.define(
                'x-observes-as-custom-element',
                Observes.CustomElementConstructor
            );
            const elm = document.createElement('x-observes-as-custom-element');
            document.body.appendChild(elm);
            return elm;
        },
        createElement: () => {
            const elm = createElement('x-observes', { is: Observes });
            document.body.appendChild(elm);
            return elm;
        },
    };

    Object.entries(constructorMethods).forEach(([name, makeElement]) => {
        // TODO [#2972]: LWC components do not respect observedAttributes/attributeChangedCallback
        it(`${name} - should not observe attributes`, () => {
            const elm = makeElement();

            elm.setAttribute('foo', 'bar');
            elm.removeAttribute('foo');

            expect(elm.changes).toEqual([]);
        });
    });
});
