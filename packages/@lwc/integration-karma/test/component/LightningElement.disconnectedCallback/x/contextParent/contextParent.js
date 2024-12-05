import { LightningElement, api } from 'lwc';

export default class ContextParent extends LightningElement {
    @api
    state;

    @api
    hideChild = false;

    get showChild() {
        return !this.hideChild;
    }
}
