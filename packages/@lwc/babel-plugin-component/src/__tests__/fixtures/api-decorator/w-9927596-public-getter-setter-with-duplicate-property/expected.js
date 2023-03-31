import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
class Text {
  foo = 1;
  get foo() {}
  set foo(value) {}
}
_registerDecorators(Text, {
  publicProps: {
    foo: {
      config: 3
    }
  },
  fields: ["foo"]
});
export default _registerComponent(Text, {
  tmpl: _tmpl,
  sel: "lwc-test"
});