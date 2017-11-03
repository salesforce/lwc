import { Element } from "engine";

export default class CompatExpando extends Element {
    state = {};
    
    @api
    changeComputedText() {
        this.state.computed = this.state.computed ? this.state.computed + '#changed' : 'computed';
    }

    get computed() {
        return this.state.computed || 'undefined-value';
    }
}