import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
import { Foo } from "data-service";
class Test {
  wiredProp;
}
_registerDecorators(Test, {
  wire: {
    wiredProp: {
      adapter: Foo.Bar,
      dynamic: [],
      config: function ($cmp) {
        return {};
      }
    }
  }
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test"
});