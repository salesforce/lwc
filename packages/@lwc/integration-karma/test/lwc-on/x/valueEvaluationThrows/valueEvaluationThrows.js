import { LightningElement, api } from 'lwc';

let testFn;

export default class ValueNotFunction extends LightningElement {
    @api handlerType;

    @api
    get testFn() {
        return testFn;
    }
    set testFn(val) {
        testFn = val;
    }

    get eventHandlers() {
        switch (this.handlerType) {
            case 'getter that throws':
                return {
                    get click() {
                        throw new Error('some error');
                    },
                };
            case 'LightningElement instance':
                return new (class extends LightningElement {
                    render() {
                        testFn();
                    }
                })();
            default:
                return {};
        }
    }
}
