import { registerDecorators as _registerDecorators } from "lwc";
import _tmpl from "./test.html";
import { createElement, LightningElement, registerComponent as _registerComponent } from "lwc";
class Test extends LightningElement {
  interface;
  static;
  for;
  function;
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  publicProps: {
    "static": {
      config: 0
    }
  },
  track: {
    "for": 1
  },
  wire: {
    function: {
      adapter: createElement,
      config: function ($cmp) {
        return {};
      }
    }
  },
  fields: ["interface"]
});
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;