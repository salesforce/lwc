import { LightningElement } from 'lwc';

export default class GetterClassList extends LightningElement{
    connectedCallback() {
        const { classList } = this;

        classList.add('a', 'b', 'c');
        classList.remove('b');

        expect(this.getAttribute('class')).toBe('a c');
    }
}