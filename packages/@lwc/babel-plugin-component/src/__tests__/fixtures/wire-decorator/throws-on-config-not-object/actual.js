import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @wire(getFoo, "$prop", ["fixed", "array"]) wiredProp;
}
