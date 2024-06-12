import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
class MyClazz {
  foo;
}
_registerDecorators(MyClazz, {
  fields: ["foo"]
});
const __lwc_component_class_internal = _registerComponent(MyClazz, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 59
});
export default __lwc_component_class_internal;