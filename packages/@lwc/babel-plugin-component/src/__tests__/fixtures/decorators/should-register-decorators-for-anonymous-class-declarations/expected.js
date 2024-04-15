import { registerDecorators as _registerDecorators, LightningElement, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
export default _registerComponent(_registerDecorators(class extends LightningElement {
  foo;
  /*LWC compiler vX.X.X*/
}, {
  publicProps: {
    foo: {
      config: 0
    }
  }
}), {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});