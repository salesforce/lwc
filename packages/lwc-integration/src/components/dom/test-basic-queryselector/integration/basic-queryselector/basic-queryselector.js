import { LightningElement, api, track } from "lwc";

export default class QuerySelector extends LightningElement {
    @track querySelectorMessage;
    @track querySelectorAllMessage;

    renderedCallback() {
        const child = this.template.querySelector('x-child');
        this.querySelectorMessage = child.querySelector('p').textContent;
        this.querySelectorAllMessage = child.querySelectorAll('p').reduce((str, el) => {
            return `${str} ${el.textContent}`;
        }, '');
    }
}
