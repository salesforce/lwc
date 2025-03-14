import { LightningElement, readonly } from 'lwc';

export default class extends LightningElement {
    foo = { willSays: 'mobs 4eva' };
    readonlyFoo = readonly(this.foo);
    wasProxyMutated = false;

    connectedCallback() {
        this.foo.mutated = true;

        // Mutating the proxy shouldn't work.
        try {
            this.readonlyFoo.readonlyMutated = true;
        } catch (e) {
            this.wasProxyMutated = !!this.readonlyFoo.readonlyMutated;
        }
    }
}
