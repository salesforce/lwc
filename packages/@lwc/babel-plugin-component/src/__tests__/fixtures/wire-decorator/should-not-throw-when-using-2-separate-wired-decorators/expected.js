import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
import { getFoo } from "data-service";
class Test {
  wired1;
  wired2;
}
_registerDecorators(Test, {
  wire: {
    wired1: {
      adapter: getFoo,
      dynamic: ["key1"],
      config: function ($cmp) {
        return {
          key2: ["fixed"],
          key1: $cmp.prop1
        };
      }
    },
    wired2: {
      adapter: getFoo,
      dynamic: ["key1"],
      config: function ($cmp) {
        return {
          key2: ["array"],
          key1: $cmp.prop1
        };
      }
    }
  }
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test"
});