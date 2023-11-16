import { LightningElement, api } from 'lwc';
export default class extends LightningElement {
    @api open = false;
    handleClose() {
        this.dispatchEvent(new CustomEvent('closemodal'));
    }
}
