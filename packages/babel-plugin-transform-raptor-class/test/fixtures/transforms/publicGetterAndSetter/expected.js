export default class Test {
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
