import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #validate(input) {
        return input != null;
    }
    #transform(input) {
        return String(input).trim();
    }
    #process(input) {
        if (this.#validate(input)) {
            return this.#transform(input);
        }
        return null;
    }
    connectedCallback() {
        this.#process('hello');
    }
}
