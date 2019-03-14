import { LightningElement, api } from 'lwc';

export default class NestedShadowTree extends LightningElement {
    @api dispatchEventComponent(evt) {
        this.dispatchEvent(evt);
    }
}
