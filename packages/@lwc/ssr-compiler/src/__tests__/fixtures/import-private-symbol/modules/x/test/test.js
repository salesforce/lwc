import { LightningElement, SYMBOL__SET_INTERNALS } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
      this[SYMBOL__SET_INTERNALS]('not', 'allowed');
    }
}
