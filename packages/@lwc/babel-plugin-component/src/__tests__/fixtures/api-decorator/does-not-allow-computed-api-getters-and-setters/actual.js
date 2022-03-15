import { LightningElement, api } from "lwc";
export default class ComputedAPIProp extends LightningElement {
  @api
  set [x](value) {}
  get [x]() {}
}
