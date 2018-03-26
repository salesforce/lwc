import { Element, api, track, wire } from 'engine';
import { getTodo } from 'todo';

export default class WiredMethod extends Element {
    @api todoId;
    @track state = { error: undefined, todo: undefined };

    @wire(getTodo, { id: '$todoId' })
    function({error, data}) {
        this.state = { error: error, todo: data };
    }
}
