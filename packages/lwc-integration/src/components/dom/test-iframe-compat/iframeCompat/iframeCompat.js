import { Element, api, track } from 'engine';

export default class IframeCompat extends Element {
    @track
    errorMessage = 'no error';

    @api
    sendMessage() {
        let frame = this.root.querySelector('iframe');
        try {
            frame.contentWindow.postMessage('foo', '*');
        } catch (e) {
            this.errorMessage = e.message;
        }
    }
}
