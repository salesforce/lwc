export default class Test {
    @api something = "custom prop";

    @api get something() {
        return this.s;
    }

    @api set something (value) {
        this.s = value;
    }
}
