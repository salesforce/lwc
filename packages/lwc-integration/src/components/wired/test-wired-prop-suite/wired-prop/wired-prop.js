import { Element } from 'engine';

export default class WiredProp extends Element {
    @api todoId;

    @wire('todo', { id: '$todoId' })
    todo;

    get error() {
        return 'Error loading data: ' + this.todo.error.message;
    }
}
