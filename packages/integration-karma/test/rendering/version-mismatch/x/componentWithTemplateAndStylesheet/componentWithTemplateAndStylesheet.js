import { LightningElement, api } from 'lwc';
import template from './componentWithTemplateAndStylesheet.html';

export default class extends LightningElement {
    @api template = template;

    render() {
        return this.template;
    }
}
