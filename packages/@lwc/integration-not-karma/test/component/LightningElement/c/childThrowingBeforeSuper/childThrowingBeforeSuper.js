import { LightningElement } from 'lwc';

export default class ChildThrowingBeforeSuper extends LightningElement {
    constructor() {
        throw new Error('Throwing before calling super');

        // eslint-disable-next-line no-unreachable
        super();
    }
}
