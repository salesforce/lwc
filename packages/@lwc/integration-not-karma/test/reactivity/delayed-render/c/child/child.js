import { LightningElement } from 'lwc';

export default class Test extends LightningElement {
    unobservedValue;

    renderedCallback() {
        // The mutation of the unobserved property must occur in a later tick, which causes the parent to render once again if
        // the property is being incorrectly observed.
        setTimeout(() => (this.unobservedValue = 'mutated'));
    }
}
