import { registerDecorators as _registerDecorators, LightningElement, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
class Test extends LightningElement {
  constructor(...args) {
    super(...args);
    this.label = 'default';
    this.count = 0;
  }
  #increment() {
    this.count++;
  }
  handleClick() {
    this.#increment();
  }
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  publicProps: {
    label: {
      config: 0
    }
  },
  fields: ["count"]
});
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;