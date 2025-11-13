import { LightningElement, api } from 'lwc';
import template from '../shared/template.html';

export default class extends LightningElement {
    // base props

    @api
    renderCount = 0;

    renderedCallback() {
        this.renderCount++;
    }

    render() {
        return template;
    }

    @api
    getPropInternal(propName) {
        return this[propName];
    }

    @api
    getAttrInternal(attrName) {
        return this.getAttribute(attrName);
    }

    @api
    setPropInternal(propName, value) {
        this[propName] = value;
    }
}
