
import { Element, api, wire } from 'engine';
import { getTodo } from 'todo';
export default class WiredProp extends Element {
    @api todoId;

    @wire(getTodo, { id: '$todoId' })
    todo;

    get error() {
        return 'Error loading data: ' + this.todo.error.message;
    }
}
