import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    props = {};

    expression = 'expression';

    @api rerender = 0;
}
