import { Element, api, wire, track } from 'engine';

export default class SingleWireMethod extends Element {
    @api todoId;

    @track error = undefined;
    @track todo = undefined;

    @wire('todo', { id: '$todoId' })
    function(error, data) {
        this.error = error;
        this.todo = data;
    }
}
