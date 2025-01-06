import { LightningElement } from 'lwc';

export default class extends LightningElement {
    isNull = null;
    connectedCallback() {
        // Non-aria set attribute should be "null"
        this.setAttribute('data-foo-set-attribute', 'foo');
        this.setAttribute('data-foo-set-attribute', null);
        this.setAttribute('data-bar-set-attribute', null);

        // Aria null (the attribute should be absent)
        this.ariaDescription = 'awesome description';
        this.ariaDescription = null;

        // Aria null setAttribute (the attribute should be "null")
        this.setAttribute('aria-label', 'awesome label');
        this.setAttribute('aria-label', null);

        // Aria undefined (the attribute should be "undefined")
        this.setAttribute('aria-describedby', 'awesome label');
        this.setAttribute('aria-describedby', undefined);
        this.ariaLabelledBy = 'id1';
        this.ariaLabelledBy = undefined;
    }
}
