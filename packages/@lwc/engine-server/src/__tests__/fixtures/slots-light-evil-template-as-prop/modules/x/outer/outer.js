import { LightningElement } from 'lwc';
import innerTemplateFn from './innerTemplateFn.html';
import tmpl from './outer.html';

export default class extends LightningElement {
    static renderMode = 'light';
    innerTemplateFn = innerTemplateFn;

    render() {
        return tmpl;
    }
}
