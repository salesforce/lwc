import { track, LightningElement } from "lwc";
export default class Test extends LightningElement {
  _record;

  @track set record(value) {
    this._record = value;
  }
}
