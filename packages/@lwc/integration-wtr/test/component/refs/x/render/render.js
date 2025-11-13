import { LightningElement, api } from 'lwc';

import a from './a.html';
import b from './b.html';

export default class extends LightningElement {
    count = 0;

    @api results = [];

    @api next() {
        this.count++;
    }

    render() {
        const { refs } = this;
        this.results.push(refs && refs.foo && refs.foo.textContent);
        return this.count % 2 === 0 ? a : b;
    }
}
