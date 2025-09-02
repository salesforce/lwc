import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    visible = true;

    @api toggleVisibility() {
        this.visible = !this.visible;
    }
}
