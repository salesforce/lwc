import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, createElement } from "lwc";
import _tmpl from "./test.html";
class Test {
  state;
  foo;
  bar;
  label;
  record = {
    value: "test"
  };
  someMethod() {}
  wiredProp;
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
  v: 58
});