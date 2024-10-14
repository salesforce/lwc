import _tmpl from "./test.html";
import lwc, { LightningElement, registerComponent as _registerComponent } from 'lwc';

// eslint-disable-next-line no-console
console.log(lwc);
const __lwc_component_class_internal = _registerComponent(class extends LightningElement {
  /*!/*LWC compiler vX.X.X*/
}, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;