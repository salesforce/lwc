import { LightningElement } from 'lwc';
import { contextualizer } from '../../../wire-adapter';

export default class ProviderComponent extends LightningElement {
    connectedCallback() {
        contextualizer(this, {
            consumerConnectedCallback(consumer) {
                consumer.provide({
                    value: 'top level'
                });
            }
        });
    }
}
