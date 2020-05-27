import { LightningElement, wire, api } from 'lwc';
import { EchoWireAdapter } from 'x/echoWireAdapter';
import { FOO, BAR } from './constants';

export default class SameAdapterDifferentConfig extends LightningElement {
    @wire(EchoWireAdapter, { prop: FOO })
    wireFuncFoo(data) {
        this.wireFoo = data;
    }

    @wire(EchoWireAdapter, { prop: BAR })
    wireFuncBar(data) {
        this.wireBar = data;
    }

    @api get wireFooData() {
        return this.wireFoo;
    }

    @api get wireBarData() {
        return this.wireBar;
    }
}
