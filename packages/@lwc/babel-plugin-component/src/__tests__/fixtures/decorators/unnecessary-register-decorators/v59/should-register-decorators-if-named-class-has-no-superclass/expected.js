import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
class MyClazz {
  foo;
}
_registerDecorators(MyClazz, {
  fields: ["foo"]
});
export default _registerComponent(MyClazz, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 59
});