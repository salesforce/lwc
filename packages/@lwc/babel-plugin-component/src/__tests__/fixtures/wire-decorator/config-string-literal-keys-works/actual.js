import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @wire(getFoo, { "key 1": "$prop", "key 2": ["fixed", "array"] })
  wiredProp;
}
