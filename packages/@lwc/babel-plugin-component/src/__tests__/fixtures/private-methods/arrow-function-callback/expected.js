import _tmpl from "./test.html";
import { LightningElement, registerComponent as _registerComponent } from 'lwc';
class Test extends LightningElement {
  #helper() {
    return 42;
  }
  connectedCallback() {
    setTimeout(() => {
      const result = this.#helper();
      console.log(result);
    }, 100);
    Promise.resolve().then(() => this.#helper());
  }
  /*LWC compiler vX.X.X*/
}
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;