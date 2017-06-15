import _tmpl from "./actual.html";
export default class Test {
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
        config: 3
    }
};
