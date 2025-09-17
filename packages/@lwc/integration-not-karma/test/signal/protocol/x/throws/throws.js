import { LightningElement } from 'lwc';

export default class extends LightningElement {
    foo;

    constructor() {
        super();

        this.foo = new Proxy(
            {},
            {
                has() {
                    throw new Error("oh no you don't!");
                },
            }
        );
    }

    renderedCallback() {
        // access `this.foo` to trigger mutation-tracker.ts
        this.bar = this.foo;
    }
}
