import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api foreignNamespaceInnerHtml = '<image xlink:href="https://www.salesforce.com/"></image>';
}
