import { LightningElement, wire } from 'lwc';

import { adapter } from './adapter';

export default class Wire extends LightningElement {
    @wire(adapter, { name: 'propAndMethod' })
    propAndMethod;

    propAndMethod() {
        throw new Error('should not be called');
    }
}
