import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    refs = 'yolo';

    @api
    next() {
        this.refs = 'woohoo';
    }
}
