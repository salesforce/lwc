import _tmpl from "./test.html";
import { registerComponent as _registerComponent, registerDecorators as _registerDecorators, LightningElement } from "lwc";
const foo = _registerDecorators(class extends LightningElement {
  foo;
  /*LWC compiler vX.X.X*/
}, {
  publicProps: {
    foo: {
      config: 0
    }
  }
});
export default _registerComponent(foo, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});