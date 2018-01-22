import { api, Element } from "engine";
const Test = 1;
export default class ClassAndTemplate extends Element {
    t = Test;
    constructor() {
        super();
        this.counter = 0;
    }

    @api
    foo;

    _bar;

    @api
    get bar() {return this._bar;}

    @api
    set bar(value) {this._bar = value;}

    @api
    hello() {
        return 'hello world!';
    }
}
