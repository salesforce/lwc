import { LightningElement, api, wire } from 'lwc';
import { getTodo } from 'x/todoApi';

export default class WireToWire extends LightningElement {
    @api
    todoId;

    @wire(getTodo, { id: '$todoId' })
    todo;

    @wire(getTodo, { id: '$todo.data.nextId' })
    todoDependent;
}
