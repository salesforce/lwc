import { LightningElement } from 'lwc';

export default class Test extends LightningElement {
    constructor() {
        super();
        // Testing the getter; don't need to use the return value
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.classList;
    }
}
