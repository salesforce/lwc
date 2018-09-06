import { LightningElement, api, track, unwrap } from "lwc";

export default class UnwrapCrossOriginIframe extends LightningElement {
    @track
    errorMessage = 'no error';

    @api
    unwrapContentWindow() {
        const contentWindow = this.root.querySelector('iframe').contentWindow;
        try {
            unwrap(contentWindow);
        } catch (e) {
            this.errorMessage = e.message;
        }
    }
}
