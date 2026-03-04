import tmpl from "./test.html";
import { LightningElement, registerDecorators, registerComponent } from "lwc";
import { getFoo } from "data-service";
const spreadMe = {
    key1: "$prop2"
};
const __lwc_component_class_internal = registerComponent(registerDecorators(class Test extends LightningElement {
/*LWC compiler vX.X.X*/}, {
    wire: {
        wiredProp: {
            adapter: getFoo,
            config: function($cmp) {
                return {
                    ...spreadMe,
                    ...{
                        key2: "$prop2"
                    }
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
