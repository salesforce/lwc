import { LightningElement } from 'lwc';

export default class ReactivityObjectFreeze extends LightningElement {
    state = {
        title: 'Welcome to Raptor fiddle!',
        todos: [
            { text: 'Learn JavaScript' },
            { text: 'Learn Raptor' },
            { text: 'Build something awesome' },
        ],
        message: 'Click to freeze',
    };
    constructor() {
        super();
        Object.freeze(this.state.todos);
    }
}
