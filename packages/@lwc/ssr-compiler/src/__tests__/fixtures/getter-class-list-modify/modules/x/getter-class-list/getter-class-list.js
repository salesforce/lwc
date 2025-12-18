import { expect } from 'vitest';
import { LightningElement } from 'lwc';

export default class GetterClassList extends LightningElement {
    connectedCallback() {
        const { classList } = this;

        classList.add('a', 'b', 'c', 'd-e', 'f', 'g', 'h', 'i');
        classList.forEach((value) => {
            classList.remove(value);
        });
        expect(this.getAttribute('class')).toBe('');
        expect(this.classList.length).toBe(0);

        classList.add('a', 'b', 'c', 'd-e', 'f', 'g', 'h', 'i');
        while (classList.length > 0) {
            classList.remove(classList.item(0));
        }
        expect(this.getAttribute('class')).toBe('');
        expect(this.classList.length).toBe(0);

        classList.add('a', 'b', 'c', 'd-e', 'f', 'g', 'h', 'i');
        expect(classList.item(3)).toBe('d-e');
    }
}
