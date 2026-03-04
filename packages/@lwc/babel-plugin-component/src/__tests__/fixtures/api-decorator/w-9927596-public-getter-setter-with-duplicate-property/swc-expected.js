import tmpl from './test.html';
import { LightningElement, registerDecorators, registerComponent } from 'lwc';
const __lwc_component_class_internal = registerComponent(
    registerDecorators(
        class Text extends LightningElement {
            get foo() {}
            set foo(value) {}
            constructor(...args) {
                (super(...args), (this.foo = 1));
            }
            /*LWC compiler vX.X.X*/
        },
        {
            publicProps: {
                foo: {
                    config: 3,
                },
            },
            fields: ['foo'],
        }
    ),
    {
        tmpl: tmpl,
        sel: 'lwc-test',
        apiVersion: 9999999,
    }
);
export default __lwc_component_class_internal;
const Text = __lwc_component_class_internal;
