import { registerDecorators as _registerDecorators, LightningElement, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
import { getSmart } from "data-service";
const symbol = Symbol.for("key");
class Test extends LightningElement {
  staticPropsRegularValues;
  staticPropsDynamicValues;
  computedPropsRegularValues;
  computedPropsDynamicValues;
  mixedAndEdgeCases;
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  wire: {
    staticPropsRegularValues: {
      adapter: getSmart,
      config: function ($cmp) {
        return {
          staticIdentifier: 'regular value',
          'staticLiteral': 'regular value',
          "computed literal can be treated like static": 'regular value'
        };
      }
    },
    staticPropsDynamicValues: {
      adapter: getSmart,
      dynamic: ["staticIdentifier", "staticLiteral", "computed literal can be treated like static"],
      config: function ($cmp) {
        let v1 = $cmp.dynamic;
        let v2 = $cmp.dynamic;
        let v3 = $cmp.dynamic;
        return {
          staticIdentifier: v1 != null ? v1.value : undefined,
          'staticLiteral': v2 != null ? v2.value : undefined,
          "computed literal can be treated like static": v3 != null ? v3.value : undefined
        };
      }
    },
    computedPropsRegularValues: {
      adapter: getSmart,
      computed: [symbol /* computed identifier */, Symbol('computed expression')],
      config: function ($cmp, $keys) {
        return {
          [$keys[0]]: 'regular value',
          [$keys[1]]: 'regular value'
        };
      }
    },
    computedPropsDynamicValues: {
      adapter: getSmart,
      computed: [symbol /* computed identifier */, Symbol('computed expression')],
      dynamic: [0, 1],
      config: function ($cmp, $keys) {
        let v1 = $cmp.dynamic;
        let v2 = $cmp.dynamic;
        return {
          [$keys[0]]: v1 != null ? v1.value : undefined,
          [$keys[1]]: v2 != null ? v2.value : undefined
        };
      }
    },
    mixedAndEdgeCases: {
      adapter: getSmart,
      computed: [undefined, Math.random(), {
        toString: Date.now
      }, `${Date.now()}`],
      dynamic: ["identifier", "dynamic", "computedStringLiteral", "1234", "321", "null", 0, 2],
      config: function ($cmp, $keys) {
        return {
          regular: 'is regular',
          'string': 'regular',
          "123": true,
          // parsed as numeric literal, i.e. `123`
          "computedNotDynamic": 'hello',
          [$keys[1]]: Math.random(),
          [$keys[3]]: 'now',
          // methods / spread should be ignored but preserved
          get foo() {},
          set bar(v) {},
          ...{
            spread: true
          },
          identifier: $cmp.dynamic,
          'dynamic': $cmp.dynamic,
          "computedStringLiteral": $cmp.prop,
          "1234": $cmp.prop,
          "321": $cmp.prop,
          "null": $cmp.prop,
          [$keys[0]]: $cmp.prop,
          [$keys[2]]: $cmp.when
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