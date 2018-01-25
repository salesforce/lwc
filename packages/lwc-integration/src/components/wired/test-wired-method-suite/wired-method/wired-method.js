import { Element } from 'engine';
import { serviceTodo } from 'todo';
export default class WiredMethod extends Element {
    @api todoId;
    @track state = { error: undefined, todo: undefined };

    @wire(serviceTodo, { id: '$todoId' })
    function(error, data) {
        this.state = { error: error, todo: data };
    }
}
