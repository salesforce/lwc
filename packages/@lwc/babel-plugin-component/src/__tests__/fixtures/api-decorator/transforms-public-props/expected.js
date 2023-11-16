import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, LightningElement } from "lwc";
import _tmpl from "./test.html";
class Test extends LightningElement {
  test = 1;
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  publicProps: {
    test: {
      config: 0
    }
  }
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});