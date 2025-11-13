import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'shadow';

    @api isTablet = false;
}
