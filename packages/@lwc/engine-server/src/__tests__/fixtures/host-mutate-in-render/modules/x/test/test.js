import { LightningElement } from 'lwc';
import template from './template.html';

export default class extends LightningElement {
    render() {
        this.setAttribute('data-mutated-in-render', 'true');
        return template;
    }
}
