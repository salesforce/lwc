import { LightningElement } from 'lwc';

export default class Test extends LightningElement {
    get hasDisconnectedCallback() {
        return 'disconnectedCallback' in this;
    }
    disconnectedCallback() {
        // This should be removed during SSR compilation
        console.log('disconnected');
    }
}
