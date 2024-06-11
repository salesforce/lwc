import _tmpl from "./test.html";
import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
const foo = _registerDecorators(class {
  foo;
}, {
  fields: ["foo"]
});
const __lwc_component_class_internal = _registerComponent(foo, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 59
});
export default __lwc_component_class_internal;