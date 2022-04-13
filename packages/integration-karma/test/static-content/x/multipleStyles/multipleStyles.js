import { LightningElement, api } from 'lwc';
import aTpl from './a.html';
import bTpl from './b.html';
import aCss from './a.css';
import bCss from './b.scoped.css?scoped=true';

const tplMap = {
    a: aTpl,
    b: bTpl,
};
export default class Container extends LightningElement {
    @api tpl = 'a';
    @api useScopeCss = false;

    render() {
        const template = tplMap[this.tpl];

        template.stylesheets = this.useScopeCss ? [...aCss, ...bCss] : [...aCss];

        return template;
    }
}
