import { registerDecorators as _registerDecorators, registerDecorators as _registerDecorators2 } from "lwc";
import _tmpl from "./test.html";
import { LightningElement, registerComponent as _registerComponent } from "lwc";
class Outer extends LightningElement {
  outer;
  a = _registerDecorators2(class extends LightningElement {
    innerA;
    /*LWC compiler vX.X.X*/
  }, {
    publicProps: {
      innerA: {
        config: 0
      }
    }
  });
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Outer, {
  publicProps: {
    outer: {
      config: 0
    }
  },
  fields: ["a"]
});
const __lwc_component_class_internal = _registerComponent(Outer, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;