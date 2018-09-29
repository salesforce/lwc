import { LightningElement } from "lwc";

export default class Child extends LightningElement {
    connectedCallback() {
        this.template.ariaLabel = 'tab';
        this.setAttribute('aria-label', 'button');
    }

    handleClick() {
        this.removeAttribute('aria-label');
    }
}
