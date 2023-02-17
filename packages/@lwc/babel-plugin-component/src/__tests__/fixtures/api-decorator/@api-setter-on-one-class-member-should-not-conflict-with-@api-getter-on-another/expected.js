import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
class Test {
  set first(value) {}
  get first() {}
  get second() {
    return this.s;
  }
  set second(value) {
    this.s = value;
  }
}
_registerDecorators(Test, {
  publicProps: {
    first: {
      config: 3
    },
    second: {
      config: 3
    }
  }
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  v: 58
});