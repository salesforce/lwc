import { LightningElement } from 'lwc';
import { contextualizer } from '../../../wire-adapter';

export default class ProviderComponent extends LightningElement {
    connectedCallback() {
        // Try to install the context provider on an ordinary object.
        const foo = {};
        contextualizer(foo, {
            consumerConnectedCallback(consumer) {
                consumer.provide({
                    value: 'some context'
                });
            }
        });
    }
}
