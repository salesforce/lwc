import { api } from "lwc";
export default class Text {
  @api foo = 1;

  _internal = 1;

  @api
  get foo() {
    return "foo";
  }
  set foo(val) {
    this._internal = val;
  }
}
