import { LightningElement, track } from 'lwc';

export default class WiredMethodSuite extends LightningElement {
    @track state = {
        todoId: 0,
    };

    handleClick() {
        this.state.todoId++;
    }
}
