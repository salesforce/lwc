import { LightningElement, wire } from 'lwc';

import { adapter } from './adapter';

export default class Wire extends LightningElement {
    propAndMethod() {
        throw new Error('should not be called');
    }

    @wire(adapter, { name: 'propAndMethod' })
    propAndMethod;
}
