import { Element } from 'engine';


export default class WeakSetCmp extends Element {
    @track item = { value: {} };
    connectedCallback() {
        const set = new WeakSet();
        const proxy = new Proxy({}, {});
        set.add(proxy);
    }
}