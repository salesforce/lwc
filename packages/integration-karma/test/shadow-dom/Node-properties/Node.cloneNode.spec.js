import { createElement } from 'lwc';

import Slotted from 'x/slotted';
import Container from 'x/container';
import ComplexCloneNode from 'x/complexCloneNode';

function testCloneNodeShadowRoot(deep) {
    it(`should not clone the associated shadowRoot when cloning an element with deep=${deep}`, () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).toBeDefined();

        // Depending if ShadowRoot is implemented natively by the browser Element.shadowRoot could be undefined. Since
        // LWC is not globally patching the Element prototype, we need to check if shadowRoot is either null or
        // undefined.
        const clone = elm.cloneNode(deep);
        expect(clone.shadowRoot === null || clone.shadowRoot === undefined).toBe(true);
    });

    // TODO: #1065 - Node.cloneNode should throw an error in all modes
    xit(`should throw when invoking cloneNode on a shadowRoot with deep=${deep}`, () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        // #984 - Can't assert against Error type, since by spec cloneNode throws a `NotSupportedError` while in LWC it
        // throws a standard Error.
        expect(() => {
            elm.shadowRoot.cloneNode(deep);
        }).toThrowError();
    });
}

describe('Node.cloneNode', () => {
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

            const clone = elm.shadowRoot.querySelector('x-container').cloneNode(false);
            expect(clone.childNodes.length).toBe(0);
            expect(clone.outerHTML).toBe('<x-container></x-container>');
        });
    });

    describe('deep=undefined', () => {
        it('should not clone shadow tree', () => {
            const elm = createElement('x-slotted', { is: Slotted });
            document.body.appendChild(elm);

            const clone = elm.cloneNode();
            expect(clone.childNodes.length).toBe(0);
            expect(clone.outerHTML).toBe('<x-slotted></x-slotted>');
        });

        it('should not clone slotted content', () => {
            const elm = createElement('x-slotted', { is: Slotted });
            document.body.appendChild(elm);

            const clone = elm.shadowRoot.querySelector('x-container').cloneNode();
            expect(clone.childNodes.length).toBe(0);
            expect(clone.outerHTML).toBe('<x-container></x-container>');
        });

        it('should not clone children of parent node with vanilla html', () => {
            const table = document.createElement('table');
            table.innerHTML = '<tr><th>Cat</th></tr><tr><th>Dog</th></tr>';
            document.body.appendChild(table);
            const clone = table.cloneNode();
            expect(clone.childNodes.length).toBe(0);
            expect(clone.outerHTML).toBe('<table></table>');
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

            const clone = elm.shadowRoot.querySelector('x-container').cloneNode(true);
            expect(clone.childNodes.length).toBe(1);
            expect(clone.outerHTML).toBe(
                '<x-container><div class="slotted">Slotted Text</div></x-container>'
            );
        });

        it('should clone complex slotted content', () => {
            const elm = createElement('x-complex-clone-node', { is: ComplexCloneNode });
            document.body.appendChild(elm);

            const clone = elm.shadowRoot.querySelector('div').cloneNode(true);
            expect(clone.childNodes.length).toBe(2);
            expect(clone.outerHTML).toBe(
                '<div>A<x-container><x-container>B</x-container><div><x-container>C</x-container></div></x-container></div>'
            );
        });

        it('should not clone default slotted content', () => {
            const elm = createElement('x-container', { is: Container });
            document.body.appendChild(elm);

            const clone = elm.cloneNode(true);
            expect(clone.childNodes.length).toBe(0);
            expect(clone.outerHTML).toBe('<x-container></x-container>');
        });

        it('should clone children of parent node with vanilla html', () => {
            const table = document.createElement('table');
            table.innerHTML = '<tbody><tr><th>Cat</th></tr><tr><th>Dog</th></tr></tbody>';
            document.body.appendChild(table);
            const clone = table.cloneNode(true);
            expect(clone.childNodes.length).toBe(1);
            expect(clone.outerHTML).toBe(
                '<table><tbody><tr><th>Cat</th></tr><tr><th>Dog</th></tr></tbody></table>'
            );
        });
    });
});
