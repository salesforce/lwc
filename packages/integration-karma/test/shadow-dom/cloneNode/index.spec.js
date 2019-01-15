import { createElement } from 'test-utils';

import Slotted from 'x/slotted';
import SlottedComplex from 'x/slottedComplex';
import Container from 'x/container';

function testCloneNodeShadowRoot(deep) {
    it(`should not clone the associated shadowRoot when cloning an element with deep=${deep}`, () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).toBeDefined();

        expect(elm.cloneNode(deep).shadowRoot).toBeNull();
    });

    it(`should throw when invoking cloneNode on a shadowRoot with deep=${deep}`, () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        // Can't assert against Error type, since by spec cloneNode throws a `NotSupportedError` while in LWC it throws
        // a standard Error.
        expect(() => {
            elm.shadowRoot.cloneNode(deep);
        }).toThrowError();
    });
}

testCloneNodeShadowRoot(true);
testCloneNodeShadowRoot(false);

describe('deep=false', () => {
    it('should not clone shadow tree', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const clone = elm.cloneNode(false);
        expect(clone.childNodes.length).toBe(0);
        expect(clone.outerHTML).toBe('<x-slotted></x-slotted>');
    });

    it('should not clone slotted content', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const clone = elm.shadowRoot
            .querySelector('x-container')
            .cloneNode(false);
        expect(clone.childNodes.length).toBe(0);
        expect(clone.outerHTML).toBe('<x-container></x-container>');
    });
});

describe('deep=true', () => {
    it('should not clone shadow tree', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const clone = elm.cloneNode(true);
        expect(clone.childNodes.length).toBe(0);
        expect(clone.outerHTML).toBe('<x-slotted></x-slotted>');
    });

    it('should clone slotted content', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const clone = elm.shadowRoot
            .querySelector('x-container')
            .cloneNode(true);
        expect(clone.childNodes.length).toBe(1);
        expect(clone.outerHTML).toBe(
            '<x-container><div class="slotted">content</div></x-container>',
        );
    });

    it('should clone complex slotted content', () => {
        const elm = createElement('x-slotted-complex', { is: SlottedComplex });
        document.body.appendChild(elm);

        const clone = elm.shadowRoot.querySelector('div').cloneNode(true);
        expect(clone.childNodes.length).toBe(2);
        expect(clone.outerHTML).toBe(
            '<div>A<x-container><x-container>B</x-container><div><x-container>C</x-container></div></x-container></div>',
        );
    });

    it('should not clone default slotted content', () => {
        const elm = createElement('x-container', { is: Container });
        document.body.appendChild(elm);

        const clone = elm.cloneNode(true);
        expect(clone.childNodes.length).toBe(0);
        expect(clone.outerHTML).toBe('<x-container></x-container>');
    });
});
