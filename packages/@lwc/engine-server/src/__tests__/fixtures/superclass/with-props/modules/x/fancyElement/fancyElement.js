import { LightningElement } from 'lwc';

export default class extends LightningElement {
    something;
    somethingElse;

    constructor(something, somethingElse) {
        super();
        this.something = something;
        this.somethingElse = somethingElse;
    }
}
