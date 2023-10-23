import { api, LightningElement } from "lwc";
export default class Text extends LightningElement {
  foo = 1;

  @api
  get foo() {}
  set foo(value) {}
}
