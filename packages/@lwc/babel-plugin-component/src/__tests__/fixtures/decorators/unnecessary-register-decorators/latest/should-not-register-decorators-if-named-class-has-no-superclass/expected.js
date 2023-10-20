import _tmpl from "./test.html";
import { registerComponent as _registerComponent } from "lwc";
class MyClazz {
  foo;
}
export default _registerComponent(MyClazz, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});