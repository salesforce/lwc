import _tmpl from "./test.html";
import { LightningElement, registerComponent as _registerComponent } from 'lwc';
class Test extends LightningElement {
  #validate(input) {
    return input != null;
  }
  #transform(input) {
    return String(input).trim();
  }
  #process(input) {
    if (this.#validate(input)) {
      return this.#transform(input);
    }
    return null;
  }
  connectedCallback() {
    this.#process('hello');
  }
  /*LWC compiler vX.X.X*/
}
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;