import tmpl from './test.html';
import { createElement, LightningElement, registerDecorators, registerComponent } from 'lwc';
const __lwc_component_class_internal = registerComponent(
    registerDecorators(
        class Test extends LightningElement {
            static {
                this.foo = 3;
            }
            static {
                this.baz = 1;
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
