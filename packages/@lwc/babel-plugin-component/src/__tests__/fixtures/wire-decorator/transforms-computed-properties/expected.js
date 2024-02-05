import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, LightningElement } from "lwc";
import _tmpl from "./test.html";
import { getFoo, getBar } from "data-service";
const symbol = Symbol.for("key");
class Test extends LightningElement {
  wiredIdentifier;
  wiredPrimitives;
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  wire: {
    wiredIdentifier: {
      adapter: getFoo,
      dynamic: [symbol],
      config: function ($cmp) {
        return {
          [symbol]: $cmp.prop
        };
      }
    },
    wiredPrimitives: {
      adapter: getBar,
      dynamic: ["computedStringLiteral", "123", "321", "null", undefined],
      config: function ($cmp) {
        return {
          ['computedStringLiteral']: $cmp.prop,
          [123n]: $cmp.prop,
          [321]: $cmp.prop,
          [null]: $cmp.prop,
          [undefined]: $cmp.prop
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