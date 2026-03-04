import tmpl from "./test.html";
import { LightningElement, registerDecorators, registerComponent } from "lwc";
import { getFoo } from "data-service";
const __lwc_component_class_internal = registerComponent(registerDecorators(class Test extends LightningElement {
/*LWC compiler vX.X.X*/}, {
    wire: {
        wiredProp: {
            adapter: getFoo,
            dynamic: [
                "key1",
                "key2"
            ],
            config: function($cmp) {
                return {
                    key3: "fixed",
                    key4: [
                        "fixed",
                        "array"
                    ],
                    key1: $cmp.prop,
                    key2: $cmp.prop
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
