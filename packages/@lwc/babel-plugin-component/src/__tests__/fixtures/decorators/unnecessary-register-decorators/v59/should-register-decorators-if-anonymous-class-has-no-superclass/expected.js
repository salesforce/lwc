import _tmpl from "./test.html";
import { registerComponent as _registerComponent, registerDecorators as _registerDecorators } from "lwc";
const foo = _registerDecorators(class {
  foo;
}, {
  fields: ["foo"]
});
export default _registerComponent(foo, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 59
});