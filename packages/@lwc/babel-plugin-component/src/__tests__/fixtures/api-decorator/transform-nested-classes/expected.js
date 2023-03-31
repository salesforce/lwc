import { registerDecorators as _registerDecorators2, registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
class Outer {
  outer;
  a = _registerDecorators2(class {
    innerA;
  }, {
    publicProps: {
      innerA: {
        config: 0
      }
    }
  });
}
_registerDecorators(Outer, {
  publicProps: {
    outer: {
      config: 0
    }
  },
  fields: ["a"]
});
export default _registerComponent(Outer, {
  tmpl: _tmpl,
  sel: "lwc-test"
});