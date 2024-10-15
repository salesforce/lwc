import { registerDecorators as _registerDecorators, LightningElement, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
import { Foo } from "data-service";
class Test extends LightningElement {
  wiredProp;
  /*@preserve LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  wire: {
    wiredProp: {
      adapter: Foo.Bar,
      dynamic: [],
      config: function ($cmp) {
        return {};
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