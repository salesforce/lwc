import _tmpl from "./test.html";
import { registerComponent as _registerComponent } from "lwc";
const foo = class {
  foo;
};
const __lwc_component_class_internal = _registerComponent(foo, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;