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
      computed: [symbol],
      dynamic: [$keys[0]],
      config: function ($cmp, $keys) {
        return {
          [$keys[0]]: $cmp.prop
        };
      }
    },
    wiredPrimitives: {
      adapter: getBar,
      computed: [Math.random(), undefined],
      dynamic: ["identifier", "dynamic", "computedStringLiteral", "123", "321", "null", $keys[1]],
      config: function ($cmp, $keys) {
        return {
          regular: 'is regular',
          'string': 'a string',
          4_5_6: true,
          "computedNotDynamic": 'hello',
          [$keys[0]]: Math.random(),
          get foo() {},
          set bar(v) {},
          identifier: $cmp.yay,
          'dynamic': $cmp.woot,
          "computedStringLiteral": $cmp.prop,
          "123": $cmp.prop,
          "321": $cmp.prop,
          "null": $cmp.prop,
          [$keys[1]]: $cmp.prop
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