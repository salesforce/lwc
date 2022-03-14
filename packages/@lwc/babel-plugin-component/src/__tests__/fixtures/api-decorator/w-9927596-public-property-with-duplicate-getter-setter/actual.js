import { api, LightningElement } from "lwc";
export default class Text extends LightningElement {
  @api foo = 1;

  get foo() {}
  set foo(value) {}
}
