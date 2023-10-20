import _tmpl from "./test.html";
import { registerComponent as _registerComponent, registerDecorators as _registerDecorators } from "lwc";
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