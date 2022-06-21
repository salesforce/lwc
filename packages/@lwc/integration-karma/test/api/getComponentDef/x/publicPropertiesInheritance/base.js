import { LightningElement, api } from 'lwc';

export default class Base extends LightningElement {
    @api get parentProp() {
        return undefined;
    }
    set parentProp(v) {}

    @api overriddenInChild;
}
