import { LightningElement, api, track } from 'lwc';
import SimpleTemplate from './simpleTemplate.html';
import TemplateWithChild from './templateWithChild.html';

export default class Parent extends LightningElement {
    @track _toggle = false;

    @api
    toggleTemplate() {
        this._toggle = !this._toggle;
    }

    render() {
        return this._toggle ? SimpleTemplate : TemplateWithChild;
    }
}
