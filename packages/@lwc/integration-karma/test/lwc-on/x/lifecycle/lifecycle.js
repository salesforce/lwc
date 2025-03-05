import { LightningElement, api } from 'lwc';

let testFoo;

export default class Lifecycle extends LightningElement {
    @api
    get testFoo() {
        return testFoo;
    }
    set testFoo(val) {
        testFoo = val;
    }

    eventHandlers = {
        foo: function () {
            testFoo('handled events dispatched from child connectedCallback');
        },
    };
}
