import { LightningElement, api } from 'lwc';

const nonEnumerableProp = Object.create(null, {
    click: {
        value: function () {
            // eslint-disable-next-line no-console
            console.log('non-enumerable handler called');
        },
        enumerable: false,
    },
});

const inheritedProp = {
    __proto__: {
        click: function () {
            // eslint-disable-next-line no-console
            console.log('inherited handler called');
        },
    },
};

const symbolKeyProp = {
    [Symbol('test')]: function () {
        // eslint-disable-next-line no-console
        console.log('symbol-keyed handler called');
    },
};
export default class Ignored extends LightningElement {
    @api propType;

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
