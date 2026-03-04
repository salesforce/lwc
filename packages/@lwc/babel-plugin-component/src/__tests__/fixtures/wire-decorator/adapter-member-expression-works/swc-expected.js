import tmpl from './test.html';
import { LightningElement, registerDecorators, registerComponent } from 'lwc';
import { Foo } from 'data-service';
const __lwc_component_class_internal = registerComponent(
    registerDecorators(
        class Test extends LightningElement {
            /*LWC compiler vX.X.X*/
        },
        {
            wire: {
                wiredProp: {
                    adapter: Foo.Bar,
                    config: function ($cmp) {
                        return {};
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
