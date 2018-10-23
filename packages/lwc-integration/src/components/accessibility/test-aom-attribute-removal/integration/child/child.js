import { LightningElement } from "lwc";

export default class Child extends LightningElement {
    connectedCallback() {
        this.internals.ariaLabel = 'tab';
    }
}
