export default class Test {
    @api get something() {
        return this.s;
    }

    @api set something (value) {
        this.s = value;
    }
}
