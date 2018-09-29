import { LightningElement, track } from "lwc";

export default class App extends LightningElement {
    @track childInnerHTML;

    renderedCallback() {
        this.childInnerHTML = this.template.querySelector('integration-child').innerHTML;
    }
}
