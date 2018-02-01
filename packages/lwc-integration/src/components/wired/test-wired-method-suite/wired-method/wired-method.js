<<<<<<< HEAD
import { Element, api, track, wire } from 'engine';
import { serviceTodo } from 'todo';

=======
import { Element } from 'engine';
import { getTodo } from 'todo';
>>>>>>> address feedbacks for @wire changes
export default class WiredMethod extends Element {
    @api todoId;
    @track state = { error: undefined, todo: undefined };

    @wire(getTodo, { id: '$todoId' })
    function(error, data) {
        this.state = { error: error, todo: data };
    }
}
