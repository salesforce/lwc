import { registerDecorators as _registerDecorators, registerDecorators as _registerDecorators2, LightningElement, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
class Outer extends LightningElement {
  constructor(...args) {
    super(...args);
    this.outer = void 0;
    this.a = _registerDecorators2(class extends LightningElement {
      constructor(...args) {
        super(...args);
        this.innerA = void 0;
      }
      /*LWC compiler vX.X.X*/
      /*LWC compiler vX.X.X*/
      /*LWC compiler vX.X.X*/
      /*LWC compiler vX.X.X*/
    }, {
      publicProps: {
        innerA: {
          config: 0
        }
      }
    });
  }
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