import { registerDecorators as _registerDecorators, registerComponent as _registerComponent, createElement, LightningElement } from "lwc";
import _tmpl from "./test.html";
const PREFIX = "prefix";
class Test extends LightningElement {
  interface;
  ["a"] = 0;
  [`${PREFIX}Field`] = "prefixed field";
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  fields: ["interface"]
});
export default _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});