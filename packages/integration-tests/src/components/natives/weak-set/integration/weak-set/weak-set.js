import { LightningElement, track } from 'lwc';

export default class WeakSetCmp extends LightningElement {
    @track item = { value: {} };
    connectedCallback() {
        const set = new WeakSet();
        const proxy = new Proxy({}, {});
        set.add(proxy);
    }
}
