import { LightningElement, api } from 'lwc';
import aTemplate from './a.html';
import bTemplate from './b.html';
import aCss from './a.css';
import bCss from './b.scoped.css?scoped=true';

const templateMap = {
    a: aTemplate,
    b: bTemplate,
};
export default class Container extends LightningElement {
    _template = aTemplate;

    @api
    updateTemplate({ name, useScopedCss }) {
        const template = templateMap[name];

        // TODO [#2826]: freeze the template object and stop supporting setting the stylesheets
        template.stylesheets = useScopedCss ? [...aCss, ...bCss] : [...aCss];

        this._template = template;
    }

    render() {
        return this._template;
    }
}
