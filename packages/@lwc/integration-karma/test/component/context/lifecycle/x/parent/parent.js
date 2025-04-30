import { LightningElement, api } from 'lwc';
import parentContextFactory from 'x/parentContext';

export default class Parent extends LightningElement {
    @api context = parentContextFactory('parent provided value');
    @api disconnect;

    disconnectedCallback() {
        if (this.disconnect) {
            this.disconnect(this);
        }
    }
}