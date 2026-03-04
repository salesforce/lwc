import tmpl from './test.html';
import { LightningElement, registerDecorators, registerComponent } from 'lwc';
const __lwc_component_class_internal = registerComponent(
    registerDecorators(
        class Text extends LightningElement {
            get aloneGet() {}
            get myget() {}
            set myget(x) {
                return 1;
            }
            m1() {}
            m2() {}
            static {
                this.ctor = 'ctor';
            }
            static get ctorGet() {
                return 1;
            }
            /*LWC compiler vX.X.X*/
        },
        {
            publicProps: {
                publicProp: {
                    config: 0,
                },
                aloneGet: {
                    config: 1,
                },
                myget: {
                    config: 3,
                },
            },
            publicMethods: ['m1'],
            fields: ['privateProp'],
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
