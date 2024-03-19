import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    mount = 'loaded on mount';

    @api
    update;
}
