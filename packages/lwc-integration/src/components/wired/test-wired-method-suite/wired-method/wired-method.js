import { Element, api, track, wire } from 'engine';

export default class WiredMethod extends Element {
    @api todoId;
    @track state = { error: undefined, todo: undefined };

    @wire('todo', { id: '$todoId' })
    function(error, data) {
        this.state = { error: error, todo: data };
    }
}
