import { LightningElement, api } from 'lwc';
// import { nameStateFactory } from 'x/state';

export default class ContextParent extends LightningElement {
    @api
    state;

    @api
    hideChild = false;

    get showChild() {
        return !this.hideChild;
    }
}
