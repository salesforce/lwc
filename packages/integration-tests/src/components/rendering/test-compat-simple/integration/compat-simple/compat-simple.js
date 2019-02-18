import { LightningElement, api, track } from 'lwc';
export default class CompatSimple extends LightningElement {
    @track
    state = { computed: 'default' };

    @api
    changeComputedText() {
        this.state.computed += '#changed';
    }

    get computed() {
        return this.state.computed;
    }
}
