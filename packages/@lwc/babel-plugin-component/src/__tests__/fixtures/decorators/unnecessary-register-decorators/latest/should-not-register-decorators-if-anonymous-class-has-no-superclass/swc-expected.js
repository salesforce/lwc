import tmpl from "./test.html";
import { registerComponent } from "lwc";
const foo = class {
};
const __lwc_component_class_internal = registerComponent(foo, {
    tmpl: tmpl,
    sel: "lwc-test",
    apiVersion: 9999999
});
export default __lwc_component_class_internal;
