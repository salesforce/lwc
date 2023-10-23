import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, LightningElement } from "lwc";
import _tmpl from "./test.html";
class Text extends LightningElement {
  foo = 1;
  get foo() {}
  set foo(value) {}
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Text, {
  publicProps: {
    foo: {
      config: 3
    }
  },
  fields: ["foo"]
});
export default _registerComponent(Text, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});