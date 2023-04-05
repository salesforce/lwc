import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, createElement } from "lwc";
import _tmpl from "./test.html";
export default _registerComponent(_registerDecorators(class {
  wiredProp;
  foo;
}, {
  wire: {
    wiredProp: {
      adapter: createElement,
      config: function ($cmp) {
        return {};
      }
    }
  },
  fields: ["foo"]
}), {
  tmpl: _tmpl,
  sel: "lwc-test",
  v: 58
});
;