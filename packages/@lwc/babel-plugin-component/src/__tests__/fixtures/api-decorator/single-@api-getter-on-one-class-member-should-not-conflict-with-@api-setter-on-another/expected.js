import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, LightningElement } from "lwc";
import _tmpl from "./test.html";
class Test extends LightningElement {
  get first() {
    return null;
  }
  get second() {
    return this.s;
  }
  set second(value) {
    this.s = value;
  }
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  publicProps: {
    first: {
      config: 1
    },
    second: {
      config: 3
    }
  }
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});