import { wire, LightningElement } from "lwc";
import { Foo } from "data-service";
export default class Test extends LightningElement {
  @wire(Foo)
  set wiredProp (val) {
    this._wiredProp = val
  }
}
