export default class RecordLayout {
    constructor() {
        this.counter = 1;
        this.labelClass = "slds-form-element__label";
        this.record = { test: "#" };
    }

    get foo () {
        return this.counter;
    }

    handleClick () {
        this.record.test = this.record.test + '#';
        this.counter = this.counter + 1;
        console.log('!', this.record.test); 
    }
}