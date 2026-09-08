import { LightningElement, api } from 'lwc';

export default class Toggle extends LightningElement {
    @api visible = false;

    toggle() {
        this.visible = !this.visible;
    }
}
