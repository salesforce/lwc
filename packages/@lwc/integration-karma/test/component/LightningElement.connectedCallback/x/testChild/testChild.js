import { LightningElement } from 'lwc';
import { consumeStateFactory } from 'x/state';

export default class TestChildSymbol extends LightningElement {
    randomChild = consumeStateFactory();

    // connectedCallback() {
    //     debugger;
    // }
}
