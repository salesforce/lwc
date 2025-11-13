import { LightningElement, api } from 'lwc';

export default class Method extends LightningElement {
    @api
    publicMethod(...args) {
        return {
            thisValue: this,
            args,
        };
    }

    privateMethod() {
        throw new Error(`No access to private method`);
    }
}
