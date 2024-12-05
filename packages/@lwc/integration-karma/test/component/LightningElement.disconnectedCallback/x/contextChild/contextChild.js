import { LightningElement } from 'lwc';
import { consumeStateFactory } from 'x/state';

export default class TestChildSymbol extends LightningElement {
    randomChild = consumeStateFactory();

    get name() {
        return this.randomChild.value.context?.value?.name ?? 'not available';
    }
}
