import { registerDecorators as _registerDecorators2, registerDecorators as _registerDecorators, registerComponent as _registerComponent, LightningElement } from "lwc";
import _tmpl from "./test.html";
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
export default _registerComponent(Outer, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});