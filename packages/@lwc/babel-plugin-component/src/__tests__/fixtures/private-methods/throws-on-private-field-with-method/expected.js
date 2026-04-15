import _tmpl from "./test.html";
function _classPrivateFieldLooseBase(e, t) { if (!{}.hasOwnProperty.call(e, t)) throw new TypeError("attempted to use private field on non-instance"); return e; }
var id = 0;
function _classPrivateFieldLooseKey(e) { return "__private_" + id++ + "_" + e; }
import { LightningElement, registerComponent as _registerComponent } from 'lwc';
var _count = /*#__PURE__*/_classPrivateFieldLooseKey("count");
class Test extends LightningElement {
  constructor(...args) {
    super(...args);
    Object.defineProperty(this, _count, {
      writable: true,
      value: 0
    });
  }
  #increment() {
    _classPrivateFieldLooseBase(this, _count)[_count]++;
  }
  /*LWC compiler vX.X.X*/
}
const __lwc_component_class_internal = _registerComponent(Test, {
  tmpl: _tmpl,
  sel: "lwc-test",
  apiVersion: 9999999
});
export default __lwc_component_class_internal;