import { LightningElement, api } from 'lwc';

const symbolKey = Symbol('test');

export default class Ignored extends LightningElement {
    eventHandlers = {};

    @api
    set symbolKeyProp(value) {
        if (value) {
            this.eventHandlers[symbolKey] = function () {
                // eslint-disable-next-line no-console
                console.log('symbol-keyed handler called');
            };
        }
    }

    @api
    set inheritedProp(value) {
        if (value) {
            Object.setPrototypeOf(this.eventHandlers, {
                click: function () {
                    // eslint-disable-next-line no-console
                    console.log('inherited handler called');
                },
            });
        }
    }

    @api
    set nonEnumerableProp(value) {
        if (value) {
            Object.defineProperty(this.eventHandlers, 'click', {
                value: function () {
                    // eslint-disable-next-line no-console
                    console.log('non-enumerable handler called');
                },
                enumerable: false,
            });
        }
    }
}
