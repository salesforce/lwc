import { registerDecorators as _registerDecorators, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
class Test {
  ariaDescribedBy;
}
_registerDecorators(Test, {
  publicProps: {
    ariaDescribedBy: {
      config: 0
    }
  }
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});