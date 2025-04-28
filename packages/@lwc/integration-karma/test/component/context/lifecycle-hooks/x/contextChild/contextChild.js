import { LightningElement } from 'lwc';
import { useAtomicState } from 'x/stateManager';

export default class ContextChild extends LightningElement {
    state = useAtomicState();

    get name() {
        debugger;
        return this.state.value.context?.value?.name ?? 'not available';
    }
}