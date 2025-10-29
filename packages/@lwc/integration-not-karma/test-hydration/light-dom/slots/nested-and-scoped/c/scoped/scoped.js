import { LightningElement, api } from 'lwc';

export default class scoped extends LightningElement {
    static renderMode = 'light';
    @api instance = 'unknown';

    get scopedItem() {
        return {
            msg: `from-c-scoped-${this.instance}`,
        };
    }
}
