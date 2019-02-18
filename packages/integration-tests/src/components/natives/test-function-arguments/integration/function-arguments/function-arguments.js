import { LightningElement, track } from 'lwc';

function argumentsIterate() {
    const res = [];
    for (let i = 0; i < arguments.length; i += 1) {
        res.push(arguments[i] + 1);
    }
    return res;
}

function argumentsTest() {
    return arguments[0].foo;
}

export default class FunctionArguments extends LightningElement {
    @track message = '';
    connectedCallback() {
        this.message = argumentsTest({ foo: 'bar' });
    }

    get items() {
        return argumentsIterate(1, 2, 3);
    }
}
