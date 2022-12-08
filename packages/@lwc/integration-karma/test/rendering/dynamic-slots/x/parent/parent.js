import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    undefinedName;
    named1Name = 'named1';
    slotWithDefaultContentName = 'named-with-default-content';
    counter = 1;

    @api
    setUndefinedName() {
        this.undefinedName = undefined;
    }

    @api
    setEmptyName() {
        this.undefinedName = '';
    }

    @api
    setFullSlotname() {
        this.undefinedName = 'altdefault';
    }

    @api
    increment() {
        this.counter = this.counter + 1;
    }
}
