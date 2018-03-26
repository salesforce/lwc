import { Element, api, wire } from 'engine';
import { getTodo } from 'x-todo-api';

export default class MultipleWires extends Element {
    idA;
    idB;

    @api set todoId(value) {
        value = Number.parseInt(value, 10);
        if (!Number.isInteger(value)) {
            this.idA = this.idB = undefined;
            return;
        }
        this.idA = value;
        this.idB = value + 1;
    }

    @api get todoId() {
        return this.idA;
    }

    @wire(getTodo, { id: '$idA' })
    todoA;

    @wire(getTodo, { id: '$idB' })
    todoB;

    get hasError() {
        return this.todoA.error || this.todoB.error;
    }

    get error() {
        return '' +
            (this.todoA.error ?  this.todoA.error.message : '') +
            ' / ' +
            (this.todoB.error ?  this.todoB.error.message : '');
    }
}
