import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
    undefinedName;
    named1Name = 'named1';
    slotWithDefaultContentName = 'named-with-default-content';
    counter = 1;
    number = 1;
    boolean = true;
    object = { a: 0 };
    functionProp = function () {};
    bigint = BigInt('39438943894384938493829198495749898939');

    @api
    setUndefinedName() {
        this.undefinedName = undefined;
    }

    @api
    setNullName() {
        this.undefinedName = null;
    }

    @api
    setSymbolName() {
        this.undefinedName = Symbol('lwc');
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
