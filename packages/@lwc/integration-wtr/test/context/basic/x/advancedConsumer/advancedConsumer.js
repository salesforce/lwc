import { LightningElement, wire, api } from 'lwc';
import { WireAdapter } from 'x/advancedProvider';

export default class ConsumerElement extends LightningElement {
    @wire(WireAdapter) context;

    @api getIdentity() {
        return this.context;
    }
}
