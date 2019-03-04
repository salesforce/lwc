import { LightningElement, api, wire } from 'lwc';
import { getTodo } from 'todo';
export default class WiredProp extends LightningElement {
    @api todoId;

    @wire(getTodo, { id: '$todoId' })
    todo;

    get error() {
        return 'Error loading data: ' + this.todo.error.message;
    }
}
