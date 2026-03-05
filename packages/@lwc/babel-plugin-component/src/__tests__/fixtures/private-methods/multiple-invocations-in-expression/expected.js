import _tmpl from "./test.html";
import { LightningElement, registerComponent as _registerComponent } from 'lwc';
class Test extends LightningElement {
  #compute(x) {
    return x * 2;
  }
  #getValue() {
    return 10;
  }
  calculate() {
    const sum = this.#compute(5) + this.#compute(10);
    const combined = this.#getValue() + this.#compute(this.#getValue());
    return sum + combined;
  }
  /*LWC compiler vX.X.X*/
}
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;