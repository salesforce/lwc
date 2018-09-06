import { LightningElement, track } from "lwc";

export default class App extends LightningElement {
    @track childOuterHTML;

    renderedCallback() {
        this.childOuterHTML = this.template.querySelector('integration-child').outerHTML;
    }
}
