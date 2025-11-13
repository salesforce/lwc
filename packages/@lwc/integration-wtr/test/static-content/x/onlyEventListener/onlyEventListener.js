import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api counts = {};
    @api dynamic = '';

    onFoo() {
        this.counts.foo = (this.counts.foo || 0) + 1;
    }

    onBar() {
        this.counts.bar = (this.counts.bar || 0) + 1;
    }
}
