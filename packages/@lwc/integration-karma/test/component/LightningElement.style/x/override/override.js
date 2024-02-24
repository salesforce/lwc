import { LightningElement, api } from 'lwc';

export default class Override extends LightningElement {
    @api
    get style() {
        return 'x-foo';
    }
}
