import { Element, api } from 'engine';
import { func } from 'globalLib';

const a = func();

export default class FooInner extends Element {
    @api
    get globalLibReturn() {
        return a;
    }
}
