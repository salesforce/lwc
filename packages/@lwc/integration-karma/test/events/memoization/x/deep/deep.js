import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api logger = {
        onClick() {
            window.clickBuffer.push(0);
        },
    };
}
