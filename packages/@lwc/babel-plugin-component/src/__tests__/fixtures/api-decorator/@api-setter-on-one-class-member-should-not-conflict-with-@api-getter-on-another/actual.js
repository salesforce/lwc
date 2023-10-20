import { api, LightningElement } from "lwc";
export default class Test extends LightningElement {
  @api
  set first(value) {}
  get first() {}

  @api
  get second() {
    return this.s;
  }
  set second(value) {
    this.s = value;
  }
}
