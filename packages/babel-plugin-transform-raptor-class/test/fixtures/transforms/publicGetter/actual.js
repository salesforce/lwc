import { Element } from "engine";
export default class Test extends Element {
    @api get publicGetter() {
        return 1;
    }
}
