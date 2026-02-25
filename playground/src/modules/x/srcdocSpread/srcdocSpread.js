import { LightningElement } from 'lwc';

const DEFAULT_PAYLOAD =
    "<script>parent.postMessage({ type: 'srcdoc-poc', payload: 'srcdoc script executed' }, '*');</script>" +
    '<p>Rendered from iframe srcdoc</p>';

export default class SrcdocSpread extends LightningElement {
    payload = DEFAULT_PAYLOAD;
    iframeProps = {
        srcdoc: DEFAULT_PAYLOAD,
        title: 'srcdoc poc iframe',
    };
    message = 'no message yet';

    connectedCallback() {
        this._onMessage = (event) => {
            if (event && event.data && event.data.type === 'srcdoc-poc') {
                this.message = event.data.payload;
            }
        };
        window.addEventListener('message', this._onMessage);
    }

    disconnectedCallback() {
        if (this._onMessage) {
            window.removeEventListener('message', this._onMessage);
        }
    }

    handleInput(event) {
        this.payload = event.target.value;
    }

    applyPayload() {
        this.iframeProps = {
            srcdoc: this.payload,
            title: 'srcdoc poc iframe',
        };
    }
}
