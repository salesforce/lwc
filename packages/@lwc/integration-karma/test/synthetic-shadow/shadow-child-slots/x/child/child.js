import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    callQuerySelectorAllStar() {
        return [...this.querySelectorAll('*')];
    }

    @api
    callQuerySelectorStar() {
        return this.querySelector('*');
    }

    @api
    callChildren() {
        return [...this.children];
    }

    @api
    callChildNodes() {
        return [...this.childNodes];
    }
}
