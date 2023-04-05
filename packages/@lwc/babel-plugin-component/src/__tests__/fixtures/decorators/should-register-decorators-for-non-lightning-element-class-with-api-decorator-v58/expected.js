import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
export default _registerComponent(_registerDecorators(class {
  foo;
}, {
  publicProps: {
    foo: {
      config: 0
    }
  }
}), {
  tmpl: _tmpl,
  sel: "lwc-test",
  v: 58
});
;