import _tmpl from './actual.html';
import { Element } from 'engine';

export default class ClassAndTemplate extends Element {
    constructor(...args) {
        var _temp;

        return _temp = super(...args), this.counter = 1, _temp;
    }

    render() {
        return _tmpl;
    }

}
