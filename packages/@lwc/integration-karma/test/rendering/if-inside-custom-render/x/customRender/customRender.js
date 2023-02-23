import { LightningElement, api } from 'lwc';
import template from './template.html';
import template2 from './template2.html';

export default class CustomRender extends LightningElement {
    templateIndex = 0;
    templateMapping = {
        0: template,
        1: template2,
    };
    showHeader = true;

    render() {
        return this.templateMapping[this.templateIndex];
    }

    @api
    back() {
        if (this.templateIndex > 0) {
            this.templateIndex--;
        }
    }

    @api
    next() {
        if (this.templateIndex < 2) {
            this.templateIndex++;
        }
    }
}
