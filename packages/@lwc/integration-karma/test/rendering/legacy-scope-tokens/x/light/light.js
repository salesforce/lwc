import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    props = {};

    @api rerender = 0;
}
