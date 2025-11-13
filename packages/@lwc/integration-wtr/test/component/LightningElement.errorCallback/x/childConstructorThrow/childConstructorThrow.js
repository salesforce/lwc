import { LightningElement } from 'lwc';

export default class ChildConstructorThrow extends LightningElement {
    constructor() {
        super();
        throw new Error('child-constructor-throw: triggered error');
    }
}
