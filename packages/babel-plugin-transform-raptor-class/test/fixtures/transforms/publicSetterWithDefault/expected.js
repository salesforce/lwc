export default class Test {
    constructor() {
        this.publicSetter = "some value";
    }

    set publicSetter(value) {
        this.thing = value;
    }
}
Test.publicProps = {
    publicSetter: {
        config: 2
    }
};
