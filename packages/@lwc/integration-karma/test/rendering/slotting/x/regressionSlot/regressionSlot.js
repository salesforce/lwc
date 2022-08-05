import { LightningElement } from 'lwc';

export default class FocusTrap extends LightningElement {
    counter = 1;

    handleContentChange() {
        // trigger rehydration.
        // triggering the rehydration on the next tick throws.
        Promise.resolve().then(() => this.counter++);
        // triggering the rehydration on this tick is fine:
        // this.counter++;
    }
}
