import { LightningElement } from "lwc";

export default class Child extends LightningElement {
    connectedCallback() {
        this.template.ariaLabel = 'tab';
    }
}
