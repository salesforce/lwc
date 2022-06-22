import { api, LightningElement } from 'lwc';

export default class MixedDirective extends LightningElement {
    @api
    items = [
        { key: 1, value: 'one' },
        { key: 2, value: 'two' },
        { key: 3, value: 'three' },
    ];

    @api
    show = false;
}
