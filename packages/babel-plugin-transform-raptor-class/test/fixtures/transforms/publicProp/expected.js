import _tmpl from "./actual.html";
export default class Test {
    test = 1;
    string = "some value";

    foo() {}

    render() {
        return _tmpl;
    }

}
Test.publicProps = {
    test: {
        config: 0,
        type: "number"
    },
    string: {
        config: 0,
        type: "string"
    }
};
