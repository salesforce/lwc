import { LightningElement, api, track } from "lwc";

export default class Child extends LightningElement {
    @track text;

    @api foo() {
        this.text = 'method executed successfully';
    }
}
