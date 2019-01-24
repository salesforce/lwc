import { LightningElement, api } from 'lwc';

export default class PublicProperties extends LightningElement {
    @api foo;
    @api bar = 1;
}
