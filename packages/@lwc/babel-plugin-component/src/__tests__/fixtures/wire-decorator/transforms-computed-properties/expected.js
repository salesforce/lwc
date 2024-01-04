import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, LightningElement } from "lwc";
import _tmpl from "./test.html";
import { getFoo, getBar } from "data-service";
const key1 = Symbol.for("key");
class Test extends LightningElement {
  wiredBar;

  // eslint-disable-next-line no-useless-computed-key
  wiredFoo;
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  wire: {
    wiredBar: {
      adapter: getBar,
      dynamic: [key1],
      config: function ($cmp) {
        return {
          key2: ["fixed", "array"],
          [key1]: $cmp.prop1
        };
      }
    },
    wiredFoo: {
      adapter: getFoo,
      dynamic: ["key1"],
      config: function ($cmp) {
        return {
          key2: ["fixed", "array"],
          ["key1"]: $cmp.prop1
        };
      }
    }
  }
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});