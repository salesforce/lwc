import { LightningElement, readonly } from 'lwc';

export default class extends LightningElement {
    foo = { willSays: 'mobs 4eva' };
    readonlyFoo = readonly(this.foo);
    wasReadonlyFooMutated = false;

    connectedCallback() {
        this.foo.willSays = 'cancel all mobs';
        // Mutating the proxy should fail.
        const newValue = 'mobs must never change';
        try {
            this.readonlyFoo.willSays = newValue;
        } catch (e) {
            this.wasReadonlyFooMutated = this.readonlyFoo.willSays === newValue;
        }
    }
}
