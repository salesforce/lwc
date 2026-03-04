import tmpl from './test.html';
import { registerDecorators, registerComponent } from 'lwc';
import MyCoolMixin from './mixin.js';
const foo = registerDecorators(
    class extends MyCoolMixin {
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
