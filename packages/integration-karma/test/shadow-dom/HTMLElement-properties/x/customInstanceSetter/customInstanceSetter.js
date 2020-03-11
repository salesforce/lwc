import { LightningElement, api } from 'lwc';

export default class MyComponent extends LightningElement {
    ctx;
    a;
    @api
    foo;

    @api
    setFoo() {
        const that = this;
        Object.defineProperty(this, 'foo', {
            set(value) {
                that.ctx = this;
                that.a = value;
            },
        });
    }

    @api
    get setterContext() {
        return this.ctx;
    }

    @api
    get componentInstance() {
        return this;
    }

    @api
    get setterValue() {
        return this.a;
    }
}
