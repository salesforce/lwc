import { Element } from "engine";
export default class Test extends Element {
    @api get something() {
        return this.s;
    }

    @api set something (value) {
        this.s = value;
    }
}
