import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api color = 'red';

    @api shown = false;
}
