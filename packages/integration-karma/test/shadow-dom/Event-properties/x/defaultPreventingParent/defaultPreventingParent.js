import { LightningElement, api } from 'lwc';

export default class DefaultPreventingParent extends LightningElement {
    @api defaultPrevented = false;
    handleFoo(evt) {
        evt.preventDefault();
        this.defaultPrevented = evt.defaultPrevented;
    }
}
