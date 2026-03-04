import tmpl from "./test.html";
import { LightningElement, registerDecorators, registerComponent } from "lwc";
const __lwc_component_class_internal = registerComponent(registerDecorators(class Outer extends LightningElement {
    constructor(...args){
        super(...args), this.a = registerDecorators(class extends LightningElement {
        }, {
            publicProps: {
                innerA: {
                    config: 0
                }
            }
        });
    }
/*LWC compiler vX.X.X*/}, {
    publicProps: {
        outer: {
            config: 0
        }
    },
    fields: [
        "a"
    ]
}), {
    tmpl: tmpl,
    sel: "lwc-test",
    apiVersion: 9999999
});
export default __lwc_component_class_internal;
const Outer = __lwc_component_class_internal;
