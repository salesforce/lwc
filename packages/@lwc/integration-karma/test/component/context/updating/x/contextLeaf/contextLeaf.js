import { LightningElement, api } from 'lwc';
import { consumeStateFactory } from 'x/stateManager';

export default class ContextLeaf extends LightningElement {
    @api state = consumeStateFactory();

    get name() {
        return this.state.value.context?.value?.name ?? 'not available';
    }
}