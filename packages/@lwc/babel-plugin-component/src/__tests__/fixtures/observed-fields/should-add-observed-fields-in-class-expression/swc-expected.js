import tmpl from './test.html';
import { createElement, LightningElement, registerDecorators, registerComponent } from 'lwc';
const Test = registerDecorators(
    class extends LightningElement {
        someMethod() {}
        constructor(...args) {
            (super(...args),
                (this.record = {
                    value: 'test',
                }));
        }
        /*LWC compiler vX.X.X*/
    },
    {
        publicProps: {
            label: {
                config: 0,
            },
        },
        publicMethods: ['someMethod'],
        track: {
            foo: 1,
            bar: 1,
        },
        wire: {
            wiredProp: {
                adapter: createElement,
                config: function ($cmp) {
                    return {};
                },
            },
        },
        fields: ['state', 'record'],
    }
);
const foo = Test;
const __lwc_component_class_internal = registerComponent(foo, {
    tmpl: tmpl,
    sel: 'lwc-test',
    apiVersion: 9999999,
});
export default __lwc_component_class_internal;
