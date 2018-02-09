import { Element, api, track } from 'engine';

export default class Child extends Element {
    @api foo;
    @track errorMessage = '';

    handleClick() {
        try {
            this.foo.x = 'bar';
        } catch (e) {
            this.errorMessage = e.message;
        }
    }
}