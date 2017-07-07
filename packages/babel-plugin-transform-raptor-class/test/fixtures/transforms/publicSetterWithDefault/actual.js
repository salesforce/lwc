import { Element } from "engine";
export default class Test extends Element {
    @api publicSetter = "some value";
    @api set publicSetter(value) {
        this.thing = value;
    }
}
