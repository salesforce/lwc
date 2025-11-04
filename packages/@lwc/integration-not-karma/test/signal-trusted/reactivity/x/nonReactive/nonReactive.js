import { LightningElement, api } from 'lwc';
import { Signal } from 'x/signal';

const externalSignal = new Signal('external signal value');

export default class extends LightningElement {
    get bar() {
        return externalSignal.value;
    }

    @api
    updateExternalSignal() {
        externalSignal.value = 'updated external value';
    }
}
