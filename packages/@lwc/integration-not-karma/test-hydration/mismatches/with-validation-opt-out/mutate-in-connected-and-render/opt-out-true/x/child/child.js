import { LightningElement } from 'lwc';
import template from './template.html';

export default class extends LightningElement {
    static validationOptOut = true;

    connectedCallback() {
        this.setAttribute('data-mutate-during-connected-callback', 'true');
    }

    render() {
        this.setAttribute('data-mutate-during-render', 'true');
        return template;
    }
}
