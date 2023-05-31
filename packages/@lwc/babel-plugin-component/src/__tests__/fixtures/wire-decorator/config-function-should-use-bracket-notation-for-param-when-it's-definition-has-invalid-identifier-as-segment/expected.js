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
      dynamic: ["key1", "key2"],
      config: function ($cmp) {
        let v1 = $cmp["prop1"];
        let v2 = $cmp.p1;
        return {
          key1: v1 != null ? v1["a b"] : undefined,
          key2: v2 != null ? v2.p2 : undefined
        };
      }
    }
  }
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test"
});