import _tmpl from "./test.html";
import { LightningElement, registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
const foo = _registerDecorators(class extends LightningElement {
  constructor(...args) {
    super(...args);
    this.foo = void 0;
  }
  /*LWC compiler vX.X.X*/
}, {
  publicProps: {
    foo: {
      config: 0
    }
  }
});
const __lwc_component_class_internal = _registerComponent(foo, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;