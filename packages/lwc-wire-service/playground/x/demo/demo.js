import { LightningElement, track } from 'lwc';

export default class Demo extends LightningElement {
    @track state = {
        todoId: ''
    };

    handleChange(evt) {
        const id = evt.target.value.trim();
        this.state.todoId = id;
    }
}
