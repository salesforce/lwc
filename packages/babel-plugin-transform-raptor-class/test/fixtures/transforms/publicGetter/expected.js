import _tmpl from "./actual.html";
export default class Test {
    get publicGetter() {
        return 1;
    }

    render() {
        return _tmpl;
    }

}
Test.publicProps = {
    publicGetter: {
        config: 1
    }
};
