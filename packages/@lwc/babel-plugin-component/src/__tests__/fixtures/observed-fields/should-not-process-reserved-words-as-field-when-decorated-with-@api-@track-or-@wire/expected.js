import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, createElement, LightningElement } from "lwc";
import _tmpl from "./test.html";
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
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});