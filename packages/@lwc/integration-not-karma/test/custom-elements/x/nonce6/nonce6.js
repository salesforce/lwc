import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    static nonceNumber = 6;
    @api get expectedTagName() {
        return 'x-nonce6';
    }
}
