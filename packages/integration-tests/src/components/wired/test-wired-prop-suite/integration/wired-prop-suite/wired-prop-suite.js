import { LightningElement, track } from 'lwc';

export default class WiredPropSuite extends LightningElement {
    @track state = {
        todoId: 0,
    };

    handleClick() {
        this.state.todoId++;
    }
}
