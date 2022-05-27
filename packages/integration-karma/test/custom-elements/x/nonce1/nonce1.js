import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api get expectedTagName() {
        return 'x-nonce1';
    }
}
