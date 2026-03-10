import _tmpl from "./test.html";
var _Class;
import { LightningElement, registerComponent as _registerComponent } from 'lwc';
import notScoped from './stylesheet.css';
import scoped from "./stylesheet.scoped.css?scoped=true";
const __lwc_component_class_internal = _registerComponent((_Class = class extends LightningElement {
  /*LWC compiler vX.X.X*/
}, _Class.stylesheets = [notScoped, scoped], _Class), {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;