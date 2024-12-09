import { registerDecorators as _registerDecorators, LightningElement, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
const __lwc_component_class_internal = _registerComponent(_registerDecorators(class extends LightningElement {
  label;
  counter = 0;
  #increment() {
    this.counter++;
  }
  decrement() {
    this.counter--;
  }
  /*LWC compiler vX.X.X*/
}, {
  publicProps: {
    label: {
      config: 0
    }
  },
  fields: ["counter"]
}), {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;