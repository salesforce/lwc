var _t = function ({
    h,
    i
}) {
    return h(
        "section",
        null,
        ["Test"]
    );
};

class Greeter {

    constructor(message) {
        this.greeting = message;
    }
    greet() {
        return "Hello, " + this.greeting;
    }

    render(p) {
        return _t.call(this, p);
    }

}

export default Greeter;