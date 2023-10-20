import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, createElement, LightningElement } from "lwc";
import _tmpl from "./test.html";
class Test extends LightningElement {
  state;
  foo;
  bar;
  label;
  record = {
    value: "test"
  };
  someMethod() {}
  wiredProp;
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
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});