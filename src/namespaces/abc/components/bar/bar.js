import sValue from './helpers/some.js';

export default class Bar {
    get c() {
        return this.a + this.b;
    }
    constructor(attrs) {
        console.log(attrs);
        console.log(sValue);
        this.a = attrs.a;
        this.b = attrs.b;
    }
    render(api) {
        console.log(api);
        return null;
    }
}
