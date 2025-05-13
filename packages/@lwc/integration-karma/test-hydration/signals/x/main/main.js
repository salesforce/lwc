import { LightningElement } from 'lwc';
import { Signal } from 'x/signal';

export default class Main extends LightningElement {
    signal = new Signal('initial value');

    connectedCallback() {
        this.signal.value = 'updated value';
    }
}
