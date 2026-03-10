import _tmpl from "./test.html";
import { registerComponent as _registerComponent } from "lwc";
class MyClazz {
  constructor() {
    this.foo = void 0;
  }
}
const __lwc_component_class_internal = _registerComponent(MyClazz, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;