import { LightningElement } from 'lwc';
import { contextualizerB } from '../../../wire-adapter';

export default class ProviderComponent extends LightningElement {
    connectedCallback() {
        contextualizerB(this, {
            consumerConnectedCallback(consumer) {
                consumer.provide({
                    value: 'nested'
                });
            }
        });
    }
}
