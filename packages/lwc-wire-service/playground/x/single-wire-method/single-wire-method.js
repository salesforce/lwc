import { Element, api, wire, track } from 'engine';
import { getTodo } from 'x-todo-api';

export default class SingleWireMethod extends Element {
    @api todoId;

    @track error = undefined;
    @track todo = undefined;

    @wire(getTodo, { id: '$todoId' })
    function({error, data}) {
        this.error = error;
        this.todo = data;
    }
}
