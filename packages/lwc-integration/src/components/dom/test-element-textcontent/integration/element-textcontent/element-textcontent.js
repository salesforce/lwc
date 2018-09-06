import { LightningElement, track } from "lwc";

export default class App extends LightningElement {
    @track childTextContent;

    renderedCallback() {
        this.childTextContent = this.template.querySelector('integration-child').textContent;
    }
}
