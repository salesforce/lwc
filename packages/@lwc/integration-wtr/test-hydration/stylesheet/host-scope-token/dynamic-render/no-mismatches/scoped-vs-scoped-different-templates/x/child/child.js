import { LightningElement, api } from 'lwc';
import a from './a.html';
import b from './b.html';

export default class Child extends LightningElement {
    @api showA;
    render() {
        return this.showA ? a : b;
    }
}
