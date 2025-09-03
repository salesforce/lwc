import { LightningElement, api, track } from 'lwc';

import tmplA from './a.html';
import tmplB from './b.html';

export default class Main extends LightningElement {
    @track tmpl = tmplA;

    @api
    toggleTemplate() {
        this.tmpl = this.tmpl === tmplA ? tmplB : tmplA;
    }

    render() {
        return this.tmpl;
    }
}
