import { api, wire, Element } from 'engine';

export default class SingleWireMethod extends Element {
    @api todoId;

    @wire('todo', { id: '$todoId' })
    function(error, data) {
        this.state.error = error;
        this.state.todo = data;
    }

    constructor() {
        super();
        this.state = {
            error: undefined,
            todo: undefined
        };
    }
}
