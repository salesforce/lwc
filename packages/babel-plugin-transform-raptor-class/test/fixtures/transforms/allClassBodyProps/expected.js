export default class Text {
    get aloneGet() {}

    get myget() {}
    set myget(x) {
        return 1;
    }

    m1() {}
    m2() {}

    static get ctorGet() {
        return 1;
    }
}
Text.ctor = "ctor";
Text.publicProps = {
    publicProp: {
        config: 0
    },
    aloneGet: {
        config: 1
    },
    myget: {
        config: 3
    }
};
Text.publicMethods = ["m1"];
