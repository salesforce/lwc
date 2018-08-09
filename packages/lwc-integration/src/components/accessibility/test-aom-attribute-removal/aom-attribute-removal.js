import { LightningElement, track } from "lwc";

export default class ShadowRootAom extends LightningElement {
    @track childAriaLabel = 'button';

    handleClick() {
        this.childAriaLabel = null;
    }
}
