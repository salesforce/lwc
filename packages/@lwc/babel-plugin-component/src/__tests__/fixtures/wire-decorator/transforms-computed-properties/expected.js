import { registerDecorators as _registerDecorators, LightningElement, registerComponent as _registerComponent } from "lwc";
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
      computed: [symbol].map(key => typeof key === "symbol" ? key : String(key)),
      config: function ($cmp, $computed) {
        return {
          [$computed[0]]: $cmp.prop
        };
      }
    },
    wiredPrimitives: {
      adapter: getBar,
      dynamic: ["computedStringLiteral", "123", "321", "null", undefined],
      computed: [undefined].map(key => typeof key === "symbol" ? key : String(key)),
      config: function ($cmp, $computed) {
        return {
          ['computedStringLiteral']: $cmp.prop,
          [123n]: $cmp.prop,
          [321]: $cmp.prop,
          [null]: $cmp.prop,
          [$computed[0]]: $cmp.prop
        };
      }
    }
  }
});
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;