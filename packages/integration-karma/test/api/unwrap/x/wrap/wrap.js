import { LightningElement, api, track } from 'lwc';

export default class Wrap extends LightningElement {
    @api apiWrap;

    @track trackWrap;

    @api
    getTrackWrap(value) {
        this.trackWrap = value;
        return this.trackWrap;
    }

    @api
    getApiWrap() {
        return this.apiWrap;
    }
}
