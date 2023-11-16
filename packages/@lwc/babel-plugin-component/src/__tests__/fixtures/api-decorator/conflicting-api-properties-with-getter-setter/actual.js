import { api, LightningElement } from "lwc";
export default class Text extends LightningElement {
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
