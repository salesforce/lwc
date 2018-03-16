import { Element, api, wire } from 'engine';
import { getTodo } from 'todo-api';

export default class SingleWire extends Element {
    @api todoId;

    @wire(getTodo, { id: '$todoId' })
    todo;

    get error() {
        return 'Error loading data: ' + this.todo.error.message;
    }
}
