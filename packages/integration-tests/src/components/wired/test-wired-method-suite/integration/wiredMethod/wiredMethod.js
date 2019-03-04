import { LightningElement, api, track, wire } from 'lwc';
import { getTodo } from 'todo';

export default class WiredMethod extends LightningElement {
    @api todoId;
    @track state = { error: undefined, todo: undefined };

    @wire(getTodo, { id: '$todoId' })
    function({ error, data }) {
        this.state = { error: error, todo: data };
    }
}
