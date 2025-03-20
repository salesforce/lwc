import { LightningElement, api } from 'lwc';

let testFn;

export default class Lifecycle extends LightningElement {
    @api
    get testFn() {
        return testFn;
    }
    set testFn(val) {
        testFn = val;
    }

    eventHandlers = {
        foo: function () {
            testFn('handled events dispatched from child connectedCallback');
        },
    };
}
