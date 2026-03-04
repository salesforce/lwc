import tmpl from "./test.html";
import { registerComponent } from "lwc";
const DATA_FROM_NETWORK = [
    {
        id: "1"
    },
    {
        id: "2"
    }
];
const __lwc_component_class_internal = registerComponent(DATA_FROM_NETWORK, {
    tmpl: tmpl,
    sel: "lwc-test",
    apiVersion: 9999999
});
export default __lwc_component_class_internal;
