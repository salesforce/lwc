import { LightningElement, api } from 'lwc';

let testClick;

export default class ExecutionContext extends LightningElement {
    @api
    get testClick() {
        return testClick;
    }
    set testClick(val) {
        testClick = val;
    }

    privateVariable = "'this' is the component"; // available only on the component not on the element

    eventHandlers = {
        click: function () {
            testClick(this.privateVariable);
        },
    };
}
