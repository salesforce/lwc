import { Element, api } from "engine";
export default class CompatSimple extends Element {
    state = { computed: "default" };
    
    @api
    changeComputedText() {
        this.state.computed += '#changed';
    }

    get computed() {
        return this.state.computed;
    }

}