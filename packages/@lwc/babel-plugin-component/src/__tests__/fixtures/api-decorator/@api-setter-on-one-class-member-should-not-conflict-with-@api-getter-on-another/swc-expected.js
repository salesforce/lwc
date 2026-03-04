import tmpl from "./test.html";
import { LightningElement, registerDecorators, registerComponent } from 'lwc';
const __lwc_component_class_internal = registerComponent(registerDecorators(class Test extends LightningElement {
    set first(value) {}
    get first() {}
    get second() {
        return this.s;
    }
    set second(value) {
        this.s = value;
    }
/*LWC compiler vX.X.X*/}, {
    publicProps: {
        first: {
            config: 3
        },
        second: {
            config: 3
        }
    }
}), {
    tmpl: tmpl,
    sel: "lwc-test",
    apiVersion: 9999999
});
export default __lwc_component_class_internal;
const Test = __lwc_component_class_internal;
