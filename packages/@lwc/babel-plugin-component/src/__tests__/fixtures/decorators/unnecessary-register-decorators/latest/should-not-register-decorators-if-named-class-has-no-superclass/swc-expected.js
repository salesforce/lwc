import tmpl from "./test.html";
import { registerComponent } from "lwc";
const __lwc_component_class_internal = registerComponent(class MyClazz {
}, {
    tmpl: tmpl,
    sel: "lwc-test",
    apiVersion: 9999999
});
export default __lwc_component_class_internal;
const MyClazz = __lwc_component_class_internal;
