import { registerDecorators as _registerDecorators, LightningElement, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
class Test extends LightningElement {
  set first(value) {}
  get first() {}
  get second() {
    return this.s;
  }
  set second(value) {
    this.s = value;
  }
  /*@preserve LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  publicProps: {
    first: {
      config: 3
    },
    second: {
      config: 3
    }
  }
});
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;