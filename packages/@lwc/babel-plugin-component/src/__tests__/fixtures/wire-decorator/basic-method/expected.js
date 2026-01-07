import { registerDecorators as _registerDecorators } from "lwc";
import _tmpl from "./test.html";
import { LightningElement, registerComponent as _registerComponent } from "lwc";
import { getFoo } from "data-service";
class Test extends LightningElement {
  wiredMethod() {}
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  wire: {
    wiredMethod: {
      adapter: getFoo,
      dynamic: ["key1"],
      method: 1,
      config: function ($cmp) {
        return {
          key2: ["fixed"],
          key1: $cmp.prop1
        };
      }
    }
  }
});
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;