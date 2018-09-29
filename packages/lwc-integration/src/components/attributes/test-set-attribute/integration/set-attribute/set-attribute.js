import { LightningElement } from "lwc";

export default class SetAttribute extends LightningElement {
    connectedCallback() {
        this.setAttribute('customattribute', 'bar');
    }
}