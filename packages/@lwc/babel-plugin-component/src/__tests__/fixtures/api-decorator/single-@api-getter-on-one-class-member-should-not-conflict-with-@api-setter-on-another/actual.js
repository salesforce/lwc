import { api, LightningElement } from "lwc";
export default class Test extends LightningElement {
  @api
  get first() {
    return null;
  }

  get second() {
    return this.s;
  }
  @api
  set second(value) {
    this.s = value;
  }
}
