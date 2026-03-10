import { registerDecorators as _registerDecorators } from "lwc";
import _tmpl from "./test.html";
import { createElement, LightningElement, registerComponent as _registerComponent } from "lwc";
const PREFIX = "prefix";
class Test extends LightningElement {
  constructor(...args) {
    super(...args);
    this.interface = void 0;
    this["a"] = 0;
    this[`${PREFIX}Field`] = "prefixed field";
  }
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