import { Element } from "raptor";

export default class Form extends Element {
    constructor() {
        super();
        this.counter = 1;
        this.labelClass = "slds-form-element__label";
        this.record = { test: "#" };
        this.inputMessage = '';
    }

    get foo () {
        return this.counter;
    }

    handleClick () {
        this.record.test = this.record.test + '#';
        this.counter++;
        this.inputMessage += 'YAY!';
    }

    inputChangeHandler (e) {
        this.counter++;
        this.inputMessage = e.currentTarget.value;
    }
}
