import { LightningElement, track } from 'lwc';
import tmpl from './rehydration.html';

export default class Rehydration extends LightningElement {
    @track reactive = 0;

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