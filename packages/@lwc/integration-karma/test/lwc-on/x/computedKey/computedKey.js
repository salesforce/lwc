import { LightningElement, api } from 'lwc';

let testFn;
const mouseover = 'click';

export default class ComputedKey extends LightningElement {
    @api
    get testFn() {
        return testFn;
    }
    set testFn(val) {
        testFn = val;
    }

    eventHandlers = {
        [mouseover]: function () {
            testFn();
        },
    };
}
