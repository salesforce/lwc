import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
import importedValue from "ns/module";
import { getFoo } from "data-service";
class Test {
  wiredProp;
}
_registerDecorators(Test, {
  wire: {
    wiredProp: {
      adapter: getFoo,
      dynamic: [],
      config: function ($cmp) {
        return {
          key1: importedValue
        };
      }
    }
  }
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  v: 58
});