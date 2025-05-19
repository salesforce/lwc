import { LightningElement, api } from 'lwc';

let testFn;

const nonEnumerableProp = Object.create(null, {
    click: {
        value: function () {
            testFn('non-enumerable handler called');
        },
        enumerable: false,
    },
});

const inheritedProp = {
    __proto__: {
        click: function () {
            testFn('inherited handler called');
        },
    },
};

const symbolKeyProp = {
    [Symbol('test')]: function () {
        testFn('symbol-keyed handler called');
    },
};
export default class Ignored extends LightningElement {
    @api propType;

    @api
    get testFn() {
        return testFn;
    }
    set testFn(val) {
        testFn = val;
    }

    get eventHandlers() {
        switch (this.propType) {
            case 'non-enumerable':
                return nonEnumerableProp;
            case 'inherited':
                return inheritedProp;
            case 'symbol-keyed':
                return symbolKeyProp;
            default:
                return {};
        }
    }
}
