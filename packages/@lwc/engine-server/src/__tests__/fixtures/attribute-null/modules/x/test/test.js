import { LightningElement } from 'lwc';

export default class extends LightningElement {
    isNull = null;
    connectedCallback() {
        // Non-aria set attribute
        this.setAttribute('data-foo-set-attribute', 'foo');
        this.setAttribute('data-foo-set-attribute', null);
        this.setAttribute('data-bar-set-attribute', null);
        // Aria null (the attribute should be absent)
        this.setAttribute('aria-label', 'awesome label');
        this.setAttribute('aria-label', null);
        this.ariaDescription = 'awesome description';
        this.ariaDescription = null;
        // Aria undefined (the attribute should be present)
        this.setAttribute('aria-describedby', 'awesome label');
        this.setAttribute('aria-describedby', undefined);
        this.ariaLabelledBy = 'id1';
        this.ariaLabelledBy = undefined;
    }
}
