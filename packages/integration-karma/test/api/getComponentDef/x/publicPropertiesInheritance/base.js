import { LightningElement, api } from 'lwc';

export default class Base extends LightningElement {
    @api parentProp;
    @api overriddenInChild;
}
