import { LightningElement, track, api } from 'lwc';
export default class Props extends LightningElement {
    @track config = undefined;

    async loadOne() {
        // note, using `x-` prefix instead of `x/` because these are
        // handled by `registerForLoad`
        const one = await import('x-configone');
        this.config = { constructor: one, props: { prop1: 'prop1 value' } };
    }
    async loadTwo() {
        // note, using `x-` prefix instead of `x/` because these are
        // handled by `registerForLoad`
        const two = await import('x-configtwo');
        this.config = { constructor: two, props: { prop2: 'prop2 value' } };
    }

    @api enableOne() {
        this.loadOne();
    }
    @api enableTwo() {
        this.loadTwo();
    }
    @api disableAll() {
        this.config = null;
    }
}
