import { api } from "lwc";
export default class Test {
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
