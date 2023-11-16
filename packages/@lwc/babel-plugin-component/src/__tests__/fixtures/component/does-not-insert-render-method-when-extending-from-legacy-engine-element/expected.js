import _tmpl from "./test.html";
import { registerComponent as _registerComponent } from "lwc";
import { Element } from "engine";
class Test extends Element {
  /*LWC compiler vX.X.X*/
}
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});