import { Element } from 'engine';
export default class App extends Element {
    constructor() {
        super();
        this.state.title = 'Welcome to Raptor fiddle!';
        this.state.value = 30;
        this.state.checked = true;
    }

    onRangeChange(event){
        this.state.value = event.target.value;
    }

    handleForceValueChange(event){
        this.state.value = 100;
        this.state.checked = !this.state.checked;
    }
}
