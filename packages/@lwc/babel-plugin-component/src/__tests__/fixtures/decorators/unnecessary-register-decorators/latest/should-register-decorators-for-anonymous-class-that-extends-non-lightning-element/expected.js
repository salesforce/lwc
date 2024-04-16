import _tmpl from "./test.html";
import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import MyCoolMixin from './mixin.js';
const foo = _registerDecorators(class extends MyCoolMixin {
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