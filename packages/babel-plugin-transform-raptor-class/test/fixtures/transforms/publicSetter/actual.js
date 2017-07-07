import { Element } from "engine";
export default class Test extends Element {
    @api set publicSetter(value) {
        this.thing = value;
    }
}
