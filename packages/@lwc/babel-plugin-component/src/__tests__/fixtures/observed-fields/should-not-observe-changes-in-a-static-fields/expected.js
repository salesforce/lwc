import { registerDecorators as _registerDecorators } from "lwc";
import _tmpl from "./test.html";
import { createElement, LightningElement, registerComponent as _registerComponent } from "lwc";
class Test extends LightningElement {
  interface;
  static foo = 3;
  static baz = 1;
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  fields: ["interface"]
});
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;