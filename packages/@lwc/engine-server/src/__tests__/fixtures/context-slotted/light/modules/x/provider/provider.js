import { LightningElement } from 'lwc';
import { contextualizer } from '../../../wire-adapter';

export default class ProviderComponent extends LightningElement {
    static renderMode = 'light';
    connectedCallback() {
        contextualizer(this, {
            consumerConnectedCallback(consumer) {
                consumer.provide({
                    value: 'some context',
                });
            },
        });
    }
}
