import { registerDecorators as _registerDecorators, LightningElement, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
import { getFoo } from "data-service";
const spreadMe = {
  key1: "$prop2"
};
class Test extends LightningElement {
  wiredProp;
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  wire: {
    wiredProp: {
      adapter: getFoo,
      config: function ($cmp) {
        return {
          ...spreadMe,
          ...{
            key2: "$prop2"
          }
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