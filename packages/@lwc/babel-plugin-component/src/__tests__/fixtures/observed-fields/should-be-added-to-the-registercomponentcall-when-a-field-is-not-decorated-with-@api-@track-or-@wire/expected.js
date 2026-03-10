import { registerDecorators as _registerDecorators } from "lwc";
import _tmpl from "./test.html";
import { createElement, LightningElement, registerComponent as _registerComponent } from "lwc";
class Test extends LightningElement {
  constructor(...args) {
    super(...args);
    this.state = void 0;
    this.foo = void 0;
    this.bar = void 0;
    this.label = void 0;
    this.record = {
      value: "test"
    };
    this.wiredProp = void 0;
  }
  someMethod() {}
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  publicProps: {
    label: {
      config: 0
    }
  },
  publicMethods: ["someMethod"],
  track: {
    foo: 1,
    bar: 1
  },
  wire: {
    wiredProp: {
      adapter: createElement,
      config: function ($cmp) {
        return {};
      }
    }
  },
  fields: ["state", "record"]
});
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;