import { LightningElement } from 'lwc';

export default class FocusTrap extends LightningElement {
    counter = 1;

    async handleContentChange() {
        // this.counter++; // triggering the rehydration on this tick is fine:

        await Promise.resolve(); // trigger rehydration
        this.counter++; // triggering the rehydration on the next tick throws.
    }
}
