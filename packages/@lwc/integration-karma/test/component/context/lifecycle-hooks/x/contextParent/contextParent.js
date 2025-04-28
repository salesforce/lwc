import { LightningElement, api } from 'lwc';
import { createAtomicState } from 'x/stateManager';

export default class ContextParent extends LightningElement {
    @api state = createAtomicState();

    @api hideChild = false;

    get showChild() {
        return !this.hideChild;
    }
}