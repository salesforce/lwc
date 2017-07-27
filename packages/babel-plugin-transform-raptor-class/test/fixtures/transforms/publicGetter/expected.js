export default class Test {
    get publicGetter() {
        return 1;
    }
}
Test.publicProps = {
    publicGetter: {
        config: 1
    }
};
