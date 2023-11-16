import _tmpl from "./test.html";
import { registerComponent as _registerComponent } from "lwc";
const foo = class {
  foo;
};
export default _registerComponent(foo, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});