import { Element } from 'engine';

export default class WiredMethodSuite extends Element {
    @track state = {
        todoId: 0
    };

    handleClick() {
        this.state.todoId++;
    }
}
