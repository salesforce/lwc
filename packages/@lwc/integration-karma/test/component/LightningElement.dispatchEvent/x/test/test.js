import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api dispatch(dispatchedEvent) {
        this.dispatchEvent(dispatchedEvent);
    }
}
