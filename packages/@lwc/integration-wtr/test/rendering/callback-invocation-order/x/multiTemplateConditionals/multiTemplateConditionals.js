import { LightningElement, api } from 'lwc';
import template from './template.html';
import template2 from './template2.html';

export default class MultiTemplateConditionals extends LightningElement {
    templateIndex = 0;
    templateMapping = {
        0: template,
        1: template2,
    };

    @api
    show = false;

    render() {
        return this.templateMapping[this.templateIndex];
    }

    @api
    next() {
        if (this.templateIndex < 1) {
            this.templateIndex++;
        }
    }
}
