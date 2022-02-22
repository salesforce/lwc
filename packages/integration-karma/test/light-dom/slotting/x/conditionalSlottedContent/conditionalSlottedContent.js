import { LightningElement, api } from 'lwc';

export default class ConditionalSlottedContent extends LightningElement {
    static renderMode = 'light';

    showContent = false;

    @api
    toggleContent() {
        this.showContent = !this.showContent;
    }
}
