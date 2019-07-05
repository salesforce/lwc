import { LightningElement, track } from "lwc";
export default class DynamicCtor extends LightningElement {
    @track customCtor;

    connectedCallback() {
        this.loadCtor();
    }

    async loadCtor() {
        const ctor = await import("foo");
        this.customCtor = ctor;
    }
}