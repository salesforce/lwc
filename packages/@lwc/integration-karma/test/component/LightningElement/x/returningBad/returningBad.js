import { LightningElement } from 'lwc';

export default class MyClass extends LightningElement {
    constructor() {
        super();

        const bad = {};
        LightningElement.call(bad);

        return bad;
    }
}
