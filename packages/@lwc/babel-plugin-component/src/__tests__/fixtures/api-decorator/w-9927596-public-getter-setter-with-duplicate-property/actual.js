import { api, LightningElement } from "lwc";
export default class Text extends LightningElement {
  foo = 1;

  @api
  get foo() {
    return undefined
  }
  set foo(value) {}
}
