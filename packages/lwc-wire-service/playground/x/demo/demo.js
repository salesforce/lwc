import { Element } from 'engine';

export default class Demo extends Element {
    @track state = {
        todoId: ''
    };

    handleChange(evt) {
        const id = evt.target.value.trim();
        this.state.todoId = id;
    }
}
