import { createElement } from 'lwc';
import Slottable from 'x/slottable';

describe('children', () => {
    function expectOneSpanChild(slot) {
        expect(slot.children.length).toEqual(1);
        expect(slot.childElementCount).toEqual(1);
        expect(slot.firstElementChild && slot.firstElementChild.tagName).toEqual('SPAN');
        expect(slot.lastElementChild && slot.lastElementChild.tagName).toEqual('SPAN');
        expect(slot.firstChild && slot.firstChild.tagName).toEqual('SPAN');
        expect(slot.lastChild && slot.lastChild.tagName).toEqual('SPAN');
        expect(slot.hasChildNodes()).toEqual(true);
        expect(slot.childNodes.length).toEqual(1);
    }

    it('should have correct HTMLSlotElement.prototype.children behavior for slots created outside LWC', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);

        el.attachShadow({ mode: 'open' }).innerHTML = '<slot><span>fallback</span></slot>';

        const slot = el.shadowRoot.querySelector('slot');
        expectOneSpanChild(slot);
    });

    it('should have correct HTMLSlotElement.prototype.children behavior for LWC-created slots', () => {
        const el = createElement('x-slottable', { is: Slottable });
        document.body.appendChild(el);

        const slot = el.shadowRoot.querySelector('slot');
        expectOneSpanChild(slot);
    });
});
