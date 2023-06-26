import _tmpl from "./test.html";
import lwc, { registerComponent as _registerComponent, LightningElement } from "lwc";
// eslint-disable-next-line no-console
console.log(lwc);
export default _registerComponent(class extends LightningElement {
  /*LWC compiler vX.X.X*/
}, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});