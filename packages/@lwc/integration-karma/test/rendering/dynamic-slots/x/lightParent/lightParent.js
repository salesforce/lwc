import { LightningElement, api } from 'lwc';

export default class LightParent extends LightningElement {
    static renderMode = 'light';
    undefinedName;
    named1Name = 'named1';
    scoped = 'scoped';
    counter = 1;

    @api
    toggleUndefinedName() {
        this.undefinedName = this.undefinedName ? undefined : 'altdefault';
    }

    @api
    increment() {
        this.counter = this.counter + 1;
    }
}
