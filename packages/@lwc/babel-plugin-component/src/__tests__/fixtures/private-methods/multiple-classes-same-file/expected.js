import _tmpl from "./test.html";
import { LightningElement, registerComponent as _registerComponent } from 'lwc';
class First extends LightningElement {
  #shared() {
    return 'first';
  }
  /*LWC compiler vX.X.X*/
}
const __lwc_component_class_internal = _registerComponent(First, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;
class Second extends LightningElement {
  #shared() {
    return 'second';
  }
  /*LWC compiler vX.X.X*/
}