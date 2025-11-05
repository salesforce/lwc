import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    @api get expectedTagName() {
        return 'x-nonce15';
    }
}
