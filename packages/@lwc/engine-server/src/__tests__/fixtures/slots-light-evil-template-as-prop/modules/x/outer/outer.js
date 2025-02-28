import { LightningElement } from 'lwc';
import innerTemplateFn from './innerTemplateFn.html';
import tmpl from './outer.html';

export default class extends LightningElement {
    static renderMode = 'light';
    innerTemplateFn = innerTemplateFn;

    // This isn't strictly necessary and has no functional value relative to an implicit template. It is present
    // only to disambiguate the outer component's template from the one we're passing to the child.
    render() {
        return tmpl;
    }
}
