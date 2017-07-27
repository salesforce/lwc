export default class Test {
    constructor() {
        this.something = "custom prop";
    }

    get something() {
        return this.s;
    }

    set something(value) {
        this.s = value;
    }
}
Test.publicProps = {
    something: {
        config: 3
    }
};
