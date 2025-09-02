import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    beforeItems = [];

    @api
    afterItems = [];
}
