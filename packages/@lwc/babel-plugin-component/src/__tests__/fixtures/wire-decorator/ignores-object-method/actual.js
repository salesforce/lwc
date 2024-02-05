import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @wire(getFoo, {
    method() {}
  })
  wiredProp;
}
