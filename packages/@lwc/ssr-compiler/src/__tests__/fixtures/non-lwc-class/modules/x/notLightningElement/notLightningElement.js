class SuperClass {
    constructor() {
        this._value = 'foo';
    }
}

class NotLightningElement extends SuperClass {
    // export default class NotLightningElement extends SuperClass {
    constructor() {
        super();
        this._value += 'bar';
    }

    get value() {
        return this._value;
    }
}

export default new NotLightningElement();
