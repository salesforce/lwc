import { track, LightningElement } from "lwc";
export default class Test extends LightningElement {
  _record;

  @track changeRecord(value) {
    this._record = value;
  }
}
