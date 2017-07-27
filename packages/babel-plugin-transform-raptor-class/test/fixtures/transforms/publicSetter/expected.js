export default class Test {
    set publicSetter(value) {
        this.thing = value;
    }
}
Test.publicProps = {
    publicSetter: {
        config: 2
    }
};
