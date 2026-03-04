import tmpl from './test.html';
import { LightningElement, registerDecorators, registerComponent } from 'lwc';
const foo = registerDecorators(
    class extends LightningElement {
        /*LWC compiler vX.X.X*/
    },
    {
        publicProps: {
            foo: {
                config: 0,
            },
        },
    }
);
const __lwc_component_class_internal = registerComponent(foo, {
    tmpl: tmpl,
    sel: 'lwc-test',
    apiVersion: 9999999,
});
export default __lwc_component_class_internal;
