import { Element, track } from 'engine';

export default class ReactiveObjectLog extends Element {
    @track foo = null;
    @track errorMessage;
    connectedCallback() {
        try {
            this.foo;
        } catch (e) {
            this.errorMessage = e.message;
        }
    }
}
