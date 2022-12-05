import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    undefinedName;
    named1Name = 'named1';
    slotWithDefaultContentName = 'named-with-default-content';
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
