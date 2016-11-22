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

class Bar {

    constructor() {
        this.counter = 0;
        this.itemClassName = 'item';
        this.data = [];
    }

    handleClick() {
        this.counter += 1;
        const newData = [];
        this.data = newData;
        console.log('clicked');
    }

    static get props() {
        return {
            min: true,
            max: true,
            label: true,
            title: true
        };
    }

    render(p) {
        return _t.call(this, p);
    }

}

export default Bar;