import _tmpl from "./test.html";
import { LightningElement, registerComponent as _registerComponent } from 'lwc';
import notScoped from './stylesheet.css';
import scoped from "./stylesheet.scoped.css?scoped=true";
export default _registerComponent(class extends LightningElement {
  static stylesheets = [notScoped, scoped];
  /*LWC compiler vX.X.X*/
}, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});