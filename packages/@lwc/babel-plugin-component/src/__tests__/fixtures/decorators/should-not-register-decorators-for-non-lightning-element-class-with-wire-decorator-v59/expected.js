import _tmpl from "./test.html";
import { registerComponent as _registerComponent, createElement } from "lwc";
export default _registerComponent(class {
  @wire(createElement)
  wiredProp;
  foo;
}, {
  tmpl: _tmpl,
  sel: "lwc-test",
  v: 59
});
;