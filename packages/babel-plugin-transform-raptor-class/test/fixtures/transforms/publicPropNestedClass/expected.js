export default class Outer {
    constructor() {
        var _class, _temp;

        this.a = (_temp = _class = class {}, _class.publicProps = {
            innerA: {
                config: 0
            }
        }, _temp);
    }

}
Outer.publicProps = {
    outer: {
        config: 0
    }
};
