import { LightningElement } from 'lwc';

export default class ReturningObject extends LightningElement {
    constructor() {
        super();
        const object = document.createElement('object');
        LightningElement.call(object);
        return object;
    }
}
