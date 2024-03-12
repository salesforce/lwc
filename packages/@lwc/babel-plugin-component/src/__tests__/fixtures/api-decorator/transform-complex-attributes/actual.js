import { api, LightningElement } from "lwc";
export default class Text extends LightningElement {
  @api publicProp;
  privateProp;

  @api get aloneGet() {
    return undefined
  }
  @api get myget() {
    return undefined
  }
  set myget(x) {}
  @api m1() {}
  m2() {}
  static ctor = "ctor";
  static get ctorGet() {
    return 1;
  }
}
