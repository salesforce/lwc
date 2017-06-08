import _tmpl from "./actual.html";
export default class Test {
    test = 1;

    foo() {}

    render() {
        return _tmpl;
    }

}
Test.publicMethods = ["foo"];
