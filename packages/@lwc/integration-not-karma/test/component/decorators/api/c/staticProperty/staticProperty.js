import { LightningElement, api } from 'lwc';

export default class StaticProperty extends LightningElement {
    // People probably shouldn't do this, but they can...
    @api static staticProperty = 'wot';
}
