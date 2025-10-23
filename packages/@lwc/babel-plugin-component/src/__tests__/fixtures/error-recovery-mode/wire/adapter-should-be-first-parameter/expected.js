import { registerDecorators as _registerDecorators, LightningElement, registerComponent as _registerComponent } from "lwc";
import _tmpl from "./test.html";
import { getRecord } from "lightning/uiRecordApi";
class Test extends LightningElement {
  wiredRecord;
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  wire: {
    wiredRecord: {
      dynamic: [],
      config: function ($cmp) {
        return {};
      }
    }
  }
});
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;