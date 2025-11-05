import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api click() {
        this.refs.button.click();
    }
}
