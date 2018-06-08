import { Element, api, track } from "engine";
export default class CompatSimple extends Element {
    @track
    state = { computed: "default" };

    @api
    changeComputedText() {
        this.state.computed += '#changed';
    }

    get computed() {
        return this.state.computed;
    }

}
