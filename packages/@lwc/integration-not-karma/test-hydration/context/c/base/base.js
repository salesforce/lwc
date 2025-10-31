import { LightningElement, api } from 'lwc';

export default class Base extends LightningElement {
    @api disconnect;
    // Tests that non-decorated and inherited context works correctly
    _context;
    // Tests that decorated inherited context works correctly
    @api anotherContext;

    constructor(context, anotherContext) {
        super();
        this.context = context;
        this.anotherContext = anotherContext;
    }

    @api set context(value) {
        this._context = value;
    }

    get context() {
        return this._context;
    }

    disconnectedCallback() {
        if (this.disconnect) {
            this.disconnect();
        }
    }
}
