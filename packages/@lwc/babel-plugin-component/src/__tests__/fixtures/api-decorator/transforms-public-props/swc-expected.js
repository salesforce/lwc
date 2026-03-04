import tmpl from './test.html';
import { LightningElement, registerDecorators, registerComponent } from 'lwc';
const __lwc_component_class_internal = registerComponent(
    registerDecorators(
        class Test extends LightningElement {
            constructor(...args) {
                (super(...args), (this.test = 1));
            }
            /*LWC compiler vX.X.X*/
        },
        {
            publicProps: {
                test: {
                    config: 0,
                },
            },
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
