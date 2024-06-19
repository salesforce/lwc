import _tmpl from "./test.html";
import { registerComponent as _registerComponent } from "lwc";
const DATA_FROM_NETWORK = [{
  id: "1"
}, {
  id: "2"
}];
const __lwc_component_class_internal = _registerComponent(DATA_FROM_NETWORK, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;