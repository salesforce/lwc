import _tmpl from "./test.html";
import { LightningElement, registerComponent as _registerComponent } from 'lwc';
class Test extends LightningElement {
  #processA() {
    return 'A';
  }
  #processB() {
    return 'B';
  }
  #checkCondition() {
    return true;
  }
  run(enabled) {
    const result = enabled ? this.#processA() : this.#processB();
    const checked = this.#checkCondition() && this.#processA();
    const fallback = this.#checkCondition() || this.#processB();
    const nullable = enabled ? this.#processA() : null;
    return `${result}-${checked}-${fallback}-${nullable}`;
  }
  /*LWC compiler vX.X.X*/
}
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;