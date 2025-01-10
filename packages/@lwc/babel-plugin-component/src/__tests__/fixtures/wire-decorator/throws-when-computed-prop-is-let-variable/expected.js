import { registerDecorators as _registerDecorators, LightningElement, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
import { getFoo } from "data-service";
let key1 = 'key1';
class Test extends LightningElement {
  wiredFoo;
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  wire: {
    wiredFoo: {
      adapter: getFoo,
      dynamic: [key1],
      computed: [key1].map(key => typeof key === "symbol" ? key : String(key)),
      config: function ($cmp, $computed) {
        return {
          key2: ["fixed", "array"],
          [$computed[0]]: $cmp.prop1
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