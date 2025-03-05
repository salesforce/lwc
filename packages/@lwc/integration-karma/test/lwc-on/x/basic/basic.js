import { LightningElement, api } from 'lwc';

let testFn;
export default class Basic extends LightningElement {
    @api
    get testFn() {
        return testFn;
    }
    set testFn(val) {
        testFn = val;
    }

    eventHandlers = {
        click: function () {
            testFn('click handler called');
        },
        mouseover: function () {
            testFn('mouseover handler called');
        },
    };
}
