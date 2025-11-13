import { LightningElement, api } from 'lwc';

let testFn;

export default class Spread extends LightningElement {
    @api
    get testFn() {
        return testFn;
    }
    set testFn(val) {
        testFn = val;
    }

    spreadObject = {
        onclick: function () {
            testFn('lwc:spread handler called');
        },
    };

    eventHandlers = {
        click: function () {
            testFn('lwc:on handler called');
        },
    };
}
