import { LightningElement, api } from 'lwc';

export default class Nested extends LightningElement {
    @api showNestedContent = false;
    @api showContent = false;
}
