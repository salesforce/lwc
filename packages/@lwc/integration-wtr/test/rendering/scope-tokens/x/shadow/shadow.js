import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    props = {};

    expression = 'expression';

    renderedCallback() {
        this.refs.manual.innerHTML = '<span></span>';
    }

    @api rerender = 0;
}
