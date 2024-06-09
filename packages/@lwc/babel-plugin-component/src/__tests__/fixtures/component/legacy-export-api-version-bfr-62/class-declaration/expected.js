import _tmpl from "./test.html";
import { LightningElement, registerComponent as _registerComponent } from 'lwc';
class MyComponent extends LightningElement {
  /*LWC compiler vX.X.X*/
}
export default _registerComponent(MyComponent, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 61
});