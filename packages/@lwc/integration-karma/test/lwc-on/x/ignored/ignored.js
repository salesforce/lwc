import { LightningElement, api } from 'lwc';

let testClick;

const nonEnumerableProp = Object.create(null, {
    click: {
        value: function () {
            testClick('non-enumerable handler called');
        },
        enumerable: false,
    },
});

const inheritedProp = {
    __proto__: {
        click: function () {
            testClick('inherited handler called');
        },
    },
};

const symbolKeyProp = {
    [Symbol('test')]: function () {
        testClick('symbol-keyed handler called');
    },
};
export default class Ignored extends LightningElement {
    @api propType;

    @api
    get testClick() {
        return testClick;
    }
    set testClick(val) {
        testClick = val;
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
