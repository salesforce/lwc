import { api, LightningElement } from 'lwc';
import { fn } from '@vitest/spy';
import tmpl from './template.html';

export default class extends LightningElement {
    @api stylesheet = fn();
    render() {
        tmpl.stylesheets = [this.stylesheet];
        tmpl.stylesheetToken = 'stylesheet.token';
        return tmpl;
    }
}
