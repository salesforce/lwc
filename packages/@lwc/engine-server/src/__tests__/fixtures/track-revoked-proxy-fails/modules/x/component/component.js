import { LightningElement, track } from 'lwc';
import tmpl from './component.html';

const { revoke, proxy } = Proxy.revocable({}, {});
revoke();

export default class Rehydration extends LightningElement {
    // Doesn't need to be used, just needs to be tracked; see W-17739481
    @track reactive = proxy;

    connectedCallback() {
        Promise.resolve().then(() => {
            this.reactive = 1;
        });
    }

    render() {
        if (!this.rendered) {
            this.rendered = true;
        } else {
            throw new Error('Reactivity should be disabled on SSR.');
        }

        return tmpl;
    }
}
