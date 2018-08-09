import { LightningElement, track } from "lwc";

export default class RootQuerySelector extends LightningElement {
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
