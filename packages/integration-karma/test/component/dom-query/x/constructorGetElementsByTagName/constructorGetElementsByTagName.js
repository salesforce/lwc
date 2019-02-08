import { LightningElement } from 'lwc';

export default class ConstructorGetElementsByTagName extends LightningElement {
    constructor() {
        super();
        this.getElementsByTagName('div');
    }
}
