import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api innerHtml =
        '<pattern><image xlink:href="https://www.salesforce.com/"></image></pattern><image xlink:title="title"></image>';
}
