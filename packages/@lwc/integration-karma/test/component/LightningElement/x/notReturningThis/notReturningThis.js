import { LightningElement } from 'lwc';

export default class NotReturningThis extends LightningElement {
    constructor() {
        super();
        return {};
    }
}
