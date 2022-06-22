import { LightningElement, track } from 'lwc';

export default class Container extends LightningElement {
    @track text = [
        {
            text: 'a',
            highlight: false,
        },
    ];

    get hasParts() {
        return Array.isArray(this.text) && this.text.length > 0;
    }

    get highlight() {
        return false;
    }

    get firstPart() {
        return this.text[0];
    }

    connectedCallback() {
        this.addEventListener('click', () => {
            this.text = 'b';
        });
    }
}
