import { LightningElement, track } from 'lwc';

export default class ObjectAssign extends LightningElement {
    @track assign = { inner: 'foo' };

    connectedCallback() {
        Object.assign({}, this.assign, this.inner);
    }

    get assigned() {
        const obj = Object.assign({}, this.assign, this.inner);
        return obj.inner;
    }
}
