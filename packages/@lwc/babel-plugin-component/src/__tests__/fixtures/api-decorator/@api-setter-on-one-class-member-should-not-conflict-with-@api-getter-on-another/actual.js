import { api } from "lwc";
export default class Test {
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
