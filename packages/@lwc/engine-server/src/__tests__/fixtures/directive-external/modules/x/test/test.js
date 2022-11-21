import { api, LightningElement } from 'lwc';

export default class Hello extends LightningElement {
    @api foo;
    @api bar;
}
