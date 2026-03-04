import tmpl from './test.html';
import { LightningElement, registerDecorators, registerComponent } from 'lwc';
import { getFoo } from 'data-service';
const __lwc_component_class_internal = registerComponent(
    registerDecorators(
        class Test extends LightningElement {
            wiredMethod() {}
            /*LWC compiler vX.X.X*/
        },
        {
            wire: {
                wiredMethod: {
                    adapter: getFoo,
                    dynamic: ['key1'],
                    method: 1,
                    config: function ($cmp) {
                        return {
                            key2: ['fixed'],
                            key1: $cmp.prop1,
                        };
                    },
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
