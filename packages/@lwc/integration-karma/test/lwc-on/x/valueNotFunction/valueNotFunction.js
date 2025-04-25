import { LightningElement, api } from 'lwc';

const setterWithoutGetterObject = {};

export default class ValueNotFunction extends LightningElement {
    @api handlerType;

    get eventHandlers() {
        switch (this.handlerType) {
            case 'null':
                return { click: null };
            case 'undefined':
                return { click: undefined };
            case 'string':
                return { click: 'someString' };
            case 'setter without getter':
                return setterWithoutGetterObject;
            case 'getter that throws':
                return {
                    get click() {
                        throw new Error('some error');
                    },
                };
            default:
                return {};
        }
    }

    set foo(val) {}

    constructor() {
        super();
        setterWithoutGetterObject.click = this.foo;
    }
}
