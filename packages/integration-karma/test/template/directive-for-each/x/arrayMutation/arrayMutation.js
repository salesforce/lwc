import { api, track, LightningElement } from 'lwc';

const INITIAL = ['one', 'two', 'three', 'four', 'five'];

export default class ArraySpliceTest extends LightningElement {
    @track items = INITIAL.slice();

    @api
    spliceItems() {
        this.items.splice(1, 1);
    }

    @api
    unshiftItem() {
        this.items.unshift('unshifted');
    }

    @api
    pushItem() {
        this.items.push('pushed');
    }

    @api
    concatNativeToProxy() {
        this.items = this.items.concat(['concat 1', 'concat 2']);
    }

    @api
    concatProxyToNative() {
        this.items = ['concat 1', 'concat 2'].concat(this.items);
    }
}
