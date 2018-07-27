import { Element, api } from 'engine';

export default class MyComponent extends Element {
    @api
    get x() {
        return this._x;
    }
    set x(v) {
        this._x = parseInt(v, 10);
    }
    @api run() {
        this.setAttribute('title', 'else');
        this.setAttribute('x', 3);
    }
}