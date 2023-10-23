import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, LightningElement } from "lwc";
import _tmpl from "./test.html";
import { getFoo } from "data-service";
class Test extends LightningElement {
  wiredProp;
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  wire: {
    wiredProp: {
      adapter: getFoo,
      dynamic: ["key1", "key2"],
      config: function ($cmp) {
        return {
          key3: "fixed",
          key4: ["fixed", "array"],
          key1: $cmp.prop,
          key2: $cmp.prop
        };
      }
    }
  }
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});