import tmpl from "./test.html";
import { LightningElement, registerDecorators, registerComponent } from "lwc";
import { Foo } from "data-service";
const __lwc_component_class_internal = registerComponent(registerDecorators(class Test extends LightningElement {
    set wiredProp(val) {
        this._wiredProp = val;
    }
/*LWC compiler vX.X.X*/}, {
    wire: {
        wiredProp: {
            adapter: Foo,
            config: function($cmp) {
                return {};
            }
        }
    }
}), {
    tmpl: tmpl,
    sel: "lwc-test",
    apiVersion: 9999999
});
export default __lwc_component_class_internal;
const Test = __lwc_component_class_internal;
