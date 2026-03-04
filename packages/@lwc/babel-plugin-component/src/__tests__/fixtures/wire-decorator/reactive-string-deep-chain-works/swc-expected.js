import tmpl from "./test.html";
import { LightningElement, registerDecorators, registerComponent } from "lwc";
import { getFoo } from "data-service";
const __lwc_component_class_internal = registerComponent(registerDecorators(class Test extends LightningElement {
/*LWC compiler vX.X.X*/}, {
    wire: {
        wiredProp: {
            adapter: getFoo,
            dynamic: [
                "key1"
            ],
            config: function($cmp) {
                let v0 = $cmp.prop1;
                return {
                    key2: [
                        "fixed",
                        "array"
                    ],
                    key1: v0 != null && (v0 = v0.prop2) != null && (v0 = v0.prop3) != null ? v0.prop4 : undefined
                };
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
