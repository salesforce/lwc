import { api, LightningElement } from "lwc";
export default class Text extends LightningElement {
  @api publicProp;
  privateProp;

  @api get aloneGet() {}
  @api get myget() {}
  set myget(x) {
    return 1;
  }
  @api m1() {}
  m2() {}
  static ctor = "ctor";
  static get ctorGet() {
    return 1;
  }
}
