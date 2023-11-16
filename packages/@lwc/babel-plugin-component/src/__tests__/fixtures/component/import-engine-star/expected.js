import _tmpl from "./test.html";
import { registerComponent as _registerComponent } from "lwc";
import * as lwc from 'lwc';
export default _registerComponent(class extends lwc.LightningElement {
  /*LWC compiler vX.X.X*/
}, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});