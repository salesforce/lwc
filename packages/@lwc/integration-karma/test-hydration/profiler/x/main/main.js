import { LightningElement, api } from 'lwc';
import template from './main.html';

export default class Main extends LightningElement {
    @api greeting;

    render() {
        return template;
    }

    connectedCallback() {
        const date = Date.now();
        while (Date.now() - date < 500) {}
    }

    renderedCallback() {}

    disconnectedCallback() {}
}
