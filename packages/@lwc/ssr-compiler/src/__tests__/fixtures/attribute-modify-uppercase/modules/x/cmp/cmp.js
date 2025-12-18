import { LightningElement } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
        // Modify this component's attributes at runtime, using uppercase
        // We expect a data-lwc-host-mutated attr to be added with the mutated attribute names in unique sorted order,
        // all lowercase
        this.setAttribute('DATA-FOO', 'bar');
        this.setAttribute('ARIA-LABEL', 'haha');
        this.removeAttribute('dAtA-BaR');
    }
}
