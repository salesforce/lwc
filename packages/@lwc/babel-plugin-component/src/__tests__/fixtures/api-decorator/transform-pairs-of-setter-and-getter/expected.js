import { registerDecorators as _registerDecorators, LightningElement, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
class Test extends LightningElement {
  _a = true;
  _b = false;
  get a() {
    return this._a;
  }
  set a(value) {
    this._a = value;
  }
  get b() {
    return this._b;
  }
  set b(value) {
    this._b = value;
  }
  /*!/*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  publicProps: {
    a: {
      config: 3
    },
    b: {
      config: 3
    }
  },
  fields: ["_a", "_b"]
});
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;