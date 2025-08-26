import { LightningElement, api } from 'lwc';

export default class TemplateMutations extends LightningElement {
    @api addNode = false;
    @api hideNode = false;
}
