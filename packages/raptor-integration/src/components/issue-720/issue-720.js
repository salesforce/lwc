import { Element } from 'engine';

export default class ReactiveObjectLog extends Element {
    connectedCallback() {
        this.state.foo = null;
        try {
            this.state.foo;
        } catch (e) {
            this.state.errorMessage = e.message;
        }
    }
}