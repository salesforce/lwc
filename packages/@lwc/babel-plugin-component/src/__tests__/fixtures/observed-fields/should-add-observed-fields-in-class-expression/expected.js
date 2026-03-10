import _tmpl from "./test.html";
import { createElement, LightningElement, registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
const Test = _registerDecorators(class extends LightningElement {
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
}, {
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
const foo = Test;
const __lwc_component_class_internal = _registerComponent(foo, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;