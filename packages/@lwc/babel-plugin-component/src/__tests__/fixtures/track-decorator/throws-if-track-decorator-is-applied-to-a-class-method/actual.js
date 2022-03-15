import { track } from "lwc";
export default class Test {
  _record;

  @track changeRecord(value) {
    this._record = value;
  }
}
