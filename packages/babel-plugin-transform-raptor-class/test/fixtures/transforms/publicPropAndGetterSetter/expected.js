import _tmpl from "./actual.html";
export default class Test {
    something = "custom prop";
    get something() {
        return this.s;
    }

    set something(value) {
        this.s = value;
    }

    render() {
        return _tmpl;
    }

}

Test.publicProps = {
    something: {
        config: 3,
        type: "string"
    }
};
class AnotherTest {
    get something() {
        return this.s;
    }

    set something(value) {
        this.s = value;
    }

    something = "custom prop";

    render() {
        return _tmpl;
    }

}
AnotherTest.publicProps = {
    something: {
        config: 3,
        type: "string"
    }
};
