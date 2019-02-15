import { LightningElement } from "lwc";

export default class Child extends LightningElement {
    handleClick() {
        this.dispatchEvent(new CustomEvent('customevent'));
        this.dispatchEvent(new Event('event'));
    }
}
