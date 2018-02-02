import { Element, api, wire } from 'engine';
import { serviceTodo } from 'todo';
export default class WiredProp extends Element {
    @api todoId;

    @wire(serviceTodo, { id: '$todoId' })
    todo;

    get error() {
        return 'Error loading data: ' + this.todo.error.message;
    }
}
