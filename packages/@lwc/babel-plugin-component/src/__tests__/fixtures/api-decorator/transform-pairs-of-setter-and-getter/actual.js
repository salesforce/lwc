import { api, LightningElement } from "lwc";
export default class Test extends LightningElement {
  _a = true;
  _b = false;

  @api get a() {
    return this._a;
  }
  set a(value) {
    this._a = value;
  }
  @api get b() {
    return this._b;
  }
  set b(value) {
    this._b = value;
  }
}
