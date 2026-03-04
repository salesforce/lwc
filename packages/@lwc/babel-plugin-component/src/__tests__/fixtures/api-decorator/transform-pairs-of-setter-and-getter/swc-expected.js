import tmpl from './test.html';
import { LightningElement, registerDecorators, registerComponent } from 'lwc';
const __lwc_component_class_internal = registerComponent(
    registerDecorators(
        class Test extends LightningElement {
            get a() {
                return this._a;
            }
            set a(value) {
                this._a = value;
            }
            get b() {
                return this._b;
            }
            set b(value) {
                this._b = value;
            }
            constructor(...args) {
                (super(...args), (this._a = true), (this._b = false));
            }
            /*LWC compiler vX.X.X*/
        },
        {
            publicProps: {
                a: {
                    config: 3,
                },
                b: {
                    config: 3,
                },
            },
            fields: ['_a', '_b'],
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
