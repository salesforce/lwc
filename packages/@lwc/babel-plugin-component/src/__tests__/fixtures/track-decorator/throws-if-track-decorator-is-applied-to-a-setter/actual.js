import { track } from "lwc";
export default class Test {
  _record;

  @track set record(value) {
    this._record = value;
  }
}
