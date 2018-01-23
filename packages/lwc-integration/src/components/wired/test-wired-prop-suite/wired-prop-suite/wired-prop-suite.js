import { Element } from 'engine';

export default class WiredPropSuite extends Element {
    @track state = {
        todoId: 0
    };

    handleClick() {
        this.state.todoId++;
    }
}
