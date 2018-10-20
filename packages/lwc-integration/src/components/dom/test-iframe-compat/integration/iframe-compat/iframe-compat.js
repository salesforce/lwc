import { LightningElement, api, track } from "lwc";

export default class IframeCompat extends LightningElement {
    @track
    errorMessage = 'no error';

    @api
    sendMessage() {
        let frame = this.template.querySelector('iframe');
        try {
            frame.contentWindow.postMessage('foo', '*');
        } catch (e) {
            this.errorMessage = e.message;
        }
    }
}
