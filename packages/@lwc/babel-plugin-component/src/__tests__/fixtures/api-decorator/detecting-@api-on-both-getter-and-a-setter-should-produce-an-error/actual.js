import { api, LightningElement } from "lwc";
export default class Test extends LightningElement {
  @api
  get something() {
    return this.s;
  }
  @api
  set something(value) {
    this.s = value;
  }
}
