import { Element, api, track, unwrap } from 'engine';

export default class UnwrapCrossOriginIframe extends Element {
    @track
    errorMessage = 'no error';

    @api
    sendMessage() {
        const contentWindow = this.root.querySelector('iframe').contentWindow;
        try {
            unwrap(contentWindow);
        } catch (e) {
            this.errorMessage = e.message;
        }
    }
}
