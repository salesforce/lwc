import { Element } from 'engine';

export default class Issue828 extends Element {
    @track assign = { inner: 'foo' }
    connectedCallback() {
        const obj = Object.assign({}, this.assign, this.inner);
    }

    get assigned() {
        const obj = Object.assign({}, this.assign, this.inner);
        return obj.inner;
    }
}