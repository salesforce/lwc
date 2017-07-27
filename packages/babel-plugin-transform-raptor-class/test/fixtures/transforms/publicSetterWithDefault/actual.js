export default class Test {
    @api publicSetter = "some value";
    @api set publicSetter(value) {
        this.thing = value;
    }
}
