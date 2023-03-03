import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
class Test {
  foo() {}
}
_registerDecorators(Test, {
  publicMethods: ["foo"]
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test"
});