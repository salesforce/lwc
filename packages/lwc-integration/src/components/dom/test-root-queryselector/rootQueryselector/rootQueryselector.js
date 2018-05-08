import { Element } from 'engine';

export default class RootQuerySelector extends Element {
    state = {
        error: undefined
    }
    renderedCallback() {
        if (this.state.error) {
            return;
        }
        try {
            this.root.querySelectorAll('div');
        } catch (e) {
            this.state.error = e;
        }
    }
}