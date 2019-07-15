import { LightningElement, wire, api } from 'lwc';
import { Provider } from 'x/advancedProvider';

export default class ConsumerElement extends LightningElement {
    @wire(Provider) context;

    @api getIdentity() {
        return this.context;
    }
}
