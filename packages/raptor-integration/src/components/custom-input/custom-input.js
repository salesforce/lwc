import { Element } from 'engine';

export default class CustomInput extends Element {
    state = {
        title: 'Welcome to Raptor fiddle!',
        value: 30,
        checked: true,
    };

    onRangeChange(event) {
        this.state.value = event.target.value;
    }

    handleForceValueChange(event) {
        this.state.value = 100;
        this.state.checked = !this.state.checked;
    }
}
