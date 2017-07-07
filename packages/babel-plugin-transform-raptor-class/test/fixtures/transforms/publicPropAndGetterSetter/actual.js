import { Element } from "engine";
export default class Test extends Element {
    @api something = "custom prop";
    @api get something() {
        return this.s;
    }

    @api set something (value) {
        this.s = value;
    }


}

class AnotherTest {
    @api get something() {
        return this.s;
    }

    @api set something (value) {
        this.s = value;
    }

    @api something = "custom prop";
}
