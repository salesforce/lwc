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

    @api
    mutateCmp(cb) {
        cb(this);
    }
}
