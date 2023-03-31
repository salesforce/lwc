import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
import { getFoo } from "data-service";
class Test {
  wiredProp;
}
_registerDecorators(Test, {
  wire: {
    wiredProp: {
      adapter: getFoo,
      dynamic: ["key1"],
      config: function ($cmp) {
        let v1 = $cmp.prop1;
        return {
          key2: ["fixed", "array"],
          key1: v1 != null && (v1 = v1.prop2) != null && (v1 = v1.prop3) != null ? v1.prop4 : undefined
        };
      }
    }
  }
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test"
});