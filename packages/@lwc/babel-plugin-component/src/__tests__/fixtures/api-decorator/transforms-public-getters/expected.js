import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
class Test {
  get publicGetter() {
    return 1;
  }
}
_registerDecorators(Test, {
  publicProps: {
    publicGetter: {
      config: 1
    }
  }
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test"
});