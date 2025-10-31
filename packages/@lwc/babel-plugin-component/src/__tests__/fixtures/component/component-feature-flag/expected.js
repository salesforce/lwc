import _componentFeatureFlag from "@salesforce/featureFlag/TEST_FLAG";
import _tmpl from "./test.html";
import { LightningElement, registerComponent as _registerComponent } from "lwc";
class Test extends LightningElement {
  /*LWC compiler vX.X.X*/
}
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "x-test",
  apiVersion: 9999999,
  componentFeatureFlag: {
    value: Boolean(_componentFeatureFlag),
    path: "@salesforce/featureFlag/TEST_FLAG"
  }
});
export default __lwc_component_class_internal;