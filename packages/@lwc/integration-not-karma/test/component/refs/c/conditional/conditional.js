import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    heads = false;

    @api next() {
        this.heads = !this.heads;
    }

    @api getRef(name) {
        return this.refs[name];
    }

    @api getRefNames() {
        return Object.keys(this.refs).sort();
    }
}
