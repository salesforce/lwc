import { LightningElement, api } from 'lwc';

let testFn;

export default class ExecutionContext extends LightningElement {
    @api
    get testFn() {
        return testFn;
    }
    set testFn(val) {
        testFn = val;
    }

    privateVariable = "'this' is the component"; // available only on the component not on the element

    eventHandlers = {
        click: function () {
            testFn(this.privateVariable);
        },
    };
}
