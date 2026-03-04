import tmpl from './test.html';
import { LightningElement, registerDecorators, registerComponent } from 'lwc';
import { getFoo } from 'data-service';
const __lwc_component_class_internal = registerComponent(
    registerDecorators(
        class Test extends LightningElement {
            /*LWC compiler vX.X.X*/
        },
        {
            wire: {
                wiredProp: {
                    adapter: getFoo,
                    dynamic: ['key1', 'key2'],
                    config: function ($cmp) {
                        let v0 = $cmp['prop1'];
                        let v1 = $cmp.p1;
                        return {
                            key1: v0 != null ? v0['a b'] : undefined,
                            key2: v1 != null ? v1.p2 : undefined,
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
