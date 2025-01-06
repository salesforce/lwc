import { LightningElement } from 'lwc';

export default class extends LightningElement {
    connectedCallback() {
        // null (the attribute should be absent)
        this.setAttribute('aria-label', 'awesome label');
        this.setAttribute('aria-label', null);
        this.ariaDescription = 'awesome description';
        this.ariaDescription = null;
        // undefined (the attribute should be present)
        this.setAttribute('aria-describedby', 'awesome label');
        this.setAttribute('aria-describedby', undefined);
        this.ariaLabelledBy = 'id1';
        this.ariaLabelledBy = undefined;
    }
}
