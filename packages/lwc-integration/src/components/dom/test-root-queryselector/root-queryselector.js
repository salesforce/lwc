import { Element, track } from 'engine';

export default class RootQuerySelector extends Element {
    @track
    state = {
        error: undefined
    }

    renderedCallback() {
        if (this.state.error) {
            return;
        }
        try {
            this.template.querySelectorAll('div');
        } catch (e) {
            this.state.error = e;
        }
    }
}
