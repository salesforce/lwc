import { LightningElement, api } from 'lwc';

export default class scoped extends LightningElement {
    static renderMode = 'light';
    @api instance = 'unknown';

    get scopedItem() {
        return {
            msg: `from-x-scoped-${this.instance}`,
        };
    }
}
