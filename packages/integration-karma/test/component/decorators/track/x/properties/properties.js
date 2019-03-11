import { LightningElement, api, track } from 'lwc';

export default class Properties extends LightningElement {
    @track
    prop = 0;

    @track
    obj = { value: 0 };

    @track
    nestedObj = {
        value: {
            nestedValue: 0,
        },
    };

    @track
    array = [1, 2, 3];

    @api
    mutateCmp(cb) {
        cb(this);
    }
}
