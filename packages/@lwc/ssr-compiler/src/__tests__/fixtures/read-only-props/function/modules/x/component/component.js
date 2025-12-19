import { LightningElement, readonly } from 'lwc';

export default class extends LightningElement {
    foo = {
        mutated: false,
        readonlyMutated: false,
    };
    readonlyFoo = readonly(this.foo);

    connectedCallback() {
        this.foo.mutated = true;

        // Mutating the proxy should not work in V1 but will work in V2.
        // The V2 implementation returns the original object as readonly invokation
        // is deprecated and will be removed.
        try {
            this.readonlyFoo.readonlyMutated = true;
        } catch (e) {}
    }
}
