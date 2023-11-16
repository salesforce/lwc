import { LightningElement } from 'lwc';
import { contextualizerA, contextualizerB } from '../../../wire-adapter';

export default class ProviderComponent extends LightningElement {
    connectedCallback() {
        contextualizerA(this, {
            consumerConnectedCallback(consumer) {
                consumer.provide({
                    value: 'top-level'
                });
            }
        });
        contextualizerB(this, {
            consumerConnectedCallback(consumer) {
                consumer.provide({
                    value: 'outer-value',
                });
            }
        })
    }
}
