import { LightningElement, api, wire, track } from 'lwc';
import { getTodo } from 'x/todoApi';

export default class DefaultValueWire extends LightningElement {
    @api set todoId(value) {
        // guard against default value from parent (which is empty string)
        if (value !== "") {
            this._todoId = value;
        }
    }
    get todoId() { return this._todoId; }

    // default value of 0
    _todoId = 0;

    @wire(getTodo, { id: '$_todoId' })
    todo;

    get error() {
        return 'Error loading data: ' + this.todo.error.message;
    }
}
