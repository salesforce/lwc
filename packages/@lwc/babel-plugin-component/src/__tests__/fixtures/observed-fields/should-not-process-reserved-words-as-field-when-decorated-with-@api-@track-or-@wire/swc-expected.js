import tmpl from "./test.html";
import { createElement, LightningElement, registerDecorators, registerComponent } from "lwc";
const __lwc_component_class_internal = registerComponent(registerDecorators(class Test extends LightningElement {
/*LWC compiler vX.X.X*/}, {
    publicProps: {
        static: {
            config: 0
        }
    },
    track: {
        "for": 1
    },
    wire: {
        function: {
            adapter: createElement,
            config: function($cmp) {
                return {};
            }
        }
    },
    fields: [
        "interface"
    ]
}), {
    tmpl: tmpl,
    sel: "lwc-test",
    apiVersion: 9999999
});
export default __lwc_component_class_internal;
const Test = __lwc_component_class_internal;
