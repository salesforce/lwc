import { LightningElement } from 'lwc';

export default class Component extends LightningElement {
    color = 'blue';
    margin = 8;

    get customStyles() {
        return `
            color: ${this.color};
            margin: ${this.margin}px;
        `;
    }
}
