import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api child1Shown = false;
    @api child2Shown = false;
}
