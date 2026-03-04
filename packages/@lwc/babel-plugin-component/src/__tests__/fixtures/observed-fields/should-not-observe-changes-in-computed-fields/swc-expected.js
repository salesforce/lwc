import tmpl from './test.html';
import { createElement, LightningElement, registerDecorators, registerComponent } from 'lwc';
const PREFIX = 'prefix';
let prop;
const __lwc_component_class_internal = registerComponent(
    registerDecorators(
        class Test extends LightningElement {
            static {
                prop = `${PREFIX}Field`;
            }
            constructor(...args) {
                (super(...args), (this['a'] = 0), (this[prop] = 'prefixed field'));
            }
            /*LWC compiler vX.X.X*/
        },
        {
            fields: ['interface'],
        }
    ),
    {
        tmpl: tmpl,
        sel: 'lwc-test',
        apiVersion: 9999999,
    }
);
export default __lwc_component_class_internal;
const Test = __lwc_component_class_internal;
