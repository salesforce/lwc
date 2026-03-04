import tmpl from "./test.html";
import { registerDecorators, registerComponent } from "lwc";
import MyCoolMixin from './mixin.js';
const __lwc_component_class_internal = registerComponent(registerDecorators(class MyElement extends MyCoolMixin {
/*LWC compiler vX.X.X*/}, {
    publicProps: {
        foo: {
            config: 0
        }
    }
}), {
    tmpl: tmpl,
    sel: "lwc-test",
    apiVersion: 9999999
});
export default __lwc_component_class_internal;
const MyElement = __lwc_component_class_internal;
