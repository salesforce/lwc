import { Element, track, api } from 'engine';

export default class Child extends Element {
    @track text;
    @api
    foo() {
        this.text = 'method executed successfully';
    }
}