import { wire, LightningElement } from 'lwc';
import { Adapter } from 'x/adapter';
export default class Test extends LightningElement {
    @wire(Adapter, { value: 'get' })
    get wired() {
        throw new Error('get wired!');
    }

    @wire(Adapter, { value: 'set' })
    set wired(val) {
        throw new Error('set wired!');
    }
}
