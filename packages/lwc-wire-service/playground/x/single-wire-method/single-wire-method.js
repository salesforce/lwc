import { LightningElement, api, wire, track } from 'lwc';
import { getTodo } from 'x-todo-api';

export default class SingleWireMethod extends LightningElement {
    @api todoId;

    @track error = undefined;
    @track todo = undefined;

    @wire(getTodo, { id: '$todoId' })
    function({error, data}) {
        this.error = error;
        this.todo = data;
    }
}
