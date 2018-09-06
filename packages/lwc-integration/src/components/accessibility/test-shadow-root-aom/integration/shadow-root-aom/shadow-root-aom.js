import { LightningElement, track } from "lwc";

export default class ShadowRootAom extends LightningElement {
    connectedCallback() {
        this.root.ariaLabel = 'internallabel';
    }
}
