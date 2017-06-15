import _tmpl from "./actual.html";
export default class Test {
    set publicSetter(value) {
        this.thing = value;
    }

    render() {
        return _tmpl;
    }

}
Test.publicProps = {
    publicSetter: {
        config: 2
    }
};
