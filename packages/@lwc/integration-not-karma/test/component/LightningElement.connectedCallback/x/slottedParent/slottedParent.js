import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    @api eventHandled = false;
    connectedCallback() {
        this.template.addEventListener('cstm', () => {
            this.eventHandled = true;
        });
    }
}
