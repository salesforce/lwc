import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, createElement } from "lwc";
import _tmpl from "./test.html";
class Test {
  interface;
  static foo = 3;
  static baz = 1;
}
_registerDecorators(Test, {
  fields: ["interface"]
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test"
});